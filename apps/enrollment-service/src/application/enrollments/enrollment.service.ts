import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { EnrollmentRecord, EnrollmentRepository } from './ports/enrollment.repository';

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');

type UserSummary = { 
  id: string; 
  email: string;
  status: 'ACTIVE' | 'SUSPENDED'; 
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN' 
};

type CourseSummary = { 
  id: string; 
  code: string;
  name: string;
  description: string | null;
  capacity: number; 
  seatsTaken: number; 
  status: 'OPEN' | 'CLOSED' | 'ACTIVE' | 'INACTIVE' 
};

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly kafkaService: KafkaService,
    private readonly configService: ConfigService,
  ) {}

  async assignEnrollment(input: {
    studentId: string;
    courseId: string;
    correlationId: string;
    actorUserId: string | null;
    actorRoles: string[];
  }) {
    const teacherId = input.actorUserId;
    if (!teacherId || (!input.actorRoles.includes('TEACHER') && !input.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin context is required');
    }

    const student = await this.fetchUser(input.studentId);
    if (!student || student.userType !== 'STUDENT' || student.status !== 'ACTIVE') {
      throw new BadRequestException('Student is not eligible for enrollment');
    }

    const course = await this.fetchCourse(input.courseId);
    if (!course || !['OPEN', 'ACTIVE'].includes(course.status)) {
      throw new BadRequestException('Course is not open');
    }
    if (course.seatsTaken >= course.capacity) {
      throw new BadRequestException('Course has no available seats');
    }

    const existingEnrollment = await this.enrollmentRepository.getEnrollmentByStudentCourse(
      input.studentId,
      input.courseId,
    );
    if (existingEnrollment) {
      throw new BadRequestException('Student already enrolled');
    }

    await this.reserveCourseSeat(input.courseId, input.actorUserId, input.actorRoles);

    let enrollment;
    try {
      enrollment = await this.enrollmentRepository.createEnrollment({
        studentId: input.studentId,
        courseId: input.courseId,
      });
    } catch (error) {
      await this.releaseCourseSeat(input.courseId, input.actorUserId, input.actorRoles);
      throw error;
    }

    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.ENROLLMENT_CREATED,
      correlationId: input.correlationId,
      actorUserId: teacherId,
      payload: {
        enrollment_id: enrollment.id,
        student_id: enrollment.studentId,
        course_id: enrollment.courseId,
        assigned_by: teacherId,
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return enrollment;
  }

  async assignEnrollmentWithProfile(input: {
    email: string;
    fullName: string;
    identificationNumber?: string;
    courseId: string;
    correlationId: string;
    actorUserId: string | null;
    actorRoles: string[];
  }) {
    const teacherId = input.actorUserId;
    if (!teacherId || (!input.actorRoles.includes('TEACHER') && !input.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin context is required');
    }

    if (!input.email || !input.fullName || !input.courseId) {
      throw new BadRequestException('email, fullName and courseId are required');
    }

    const student = await this.ensureStudentProfile({
      email: input.email,
      fullName: input.fullName,
      identificationNumber: input.identificationNumber,
      correlationId: input.correlationId,
    });

    return this.assignEnrollment({
      studentId: student.id,
      courseId: input.courseId,
      correlationId: input.correlationId,
      actorUserId: input.actorUserId,
      actorRoles: input.actorRoles,
    });
  }


  private async reserveCourseSeat(courseId: string, actorUserId: string | null, actorRoles: string[]) {
    await this.updateCourseSeats(courseId, 'increment', actorUserId, actorRoles);
  }

  private async releaseCourseSeat(courseId: string, actorUserId: string | null, actorRoles: string[]) {
    await this.updateCourseSeats(courseId, 'decrement', actorUserId, actorRoles);
  }

  private async updateCourseSeats(
    courseId: string,
    action: 'increment' | 'decrement',
    actorUserId: string | null,
    actorRoles: string[],
  ) {
    const baseUrl = this.configService.get<string>('COURSE_SERVICE_URL', 'http://course-service:3004');
    const response = await fetch(`${baseUrl}/api/v1/courses/${courseId}/seats/${action}`, {
      method: 'POST',
      headers: {
        'x-user-id': actorUserId ?? '',
        'x-user-roles': actorRoles.join(',') || 'TEACHER',
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new BadRequestException(payload?.message || 'Course seat update failed');
    }
  }

  private async fetchUser(userId: string): Promise<UserSummary | null> {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://user-service:3008');
    try {
      if (typeof fetch === 'undefined') {
        return null;
      }
      const response = await fetch(`${baseUrl}/api/v1/users/${userId}`);
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as UserSummary;
    } catch {
      return null;
    }
  }

  private async fetchCourse(courseId: string): Promise<CourseSummary | null> {
    const baseUrl = this.configService.get<string>('COURSE_SERVICE_URL', 'http://course-service:3004');
    try {
      if (typeof fetch === 'undefined') {
        return null;
      }
      const response = await fetch(`${baseUrl}/api/v1/courses/${courseId}`);
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as CourseSummary;
    } catch {
      return null;
    }
  }



  async buildEnrollmentCourseView(enrollments: EnrollmentRecord[]) {
    return Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await this.fetchCourse(enrollment.courseId);
        return {
          ...enrollment,
          course: course || null,
        };
      }),
    );
  }

  async buildEnrollmentStudentView(enrollments: EnrollmentRecord[]) {
    return Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await this.fetchUser(enrollment.studentId);
        return {
          ...enrollment,
          student: student || null,
        };
      }),
    );
  }

  async buildEnrollmentAdminView(enrollments: EnrollmentRecord[]) {
    return Promise.all(
      enrollments.map(async (enrollment) => {
        const [student, course] = await Promise.all([
          this.fetchUser(enrollment.studentId),
          this.fetchCourse(enrollment.courseId),
        ]);
        return {
          ...enrollment,
          student,
          course,
        };
      }),
    );
  }

  async dropEnrollment(enrollmentId: string, context: { actorUserId: string | null; actorRoles: string[] }) {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    const existing = await this.enrollmentRepository.getEnrollmentById(enrollmentId);
    if (!existing || existing.status !== 'ACTIVE') {
      throw new NotFoundException('Enrollment not found');
    }

    await this.releaseCourseSeat(existing.courseId, context.actorUserId, context.actorRoles);
    const updated = await this.enrollmentRepository.dropEnrollment(enrollmentId);
    if (!updated) {
      throw new NotFoundException('Enrollment not found');
    }
    return updated;
  }

  private async ensureStudentProfile(input: {
    email: string;
    fullName: string;
    identificationNumber?: string;
    correlationId: string;
  }): Promise<UserSummary> {
    const normalizedEmail = input.email.toLowerCase();
    if (!normalizedEmail.includes('@')) {
      throw new BadRequestException('email is invalid');
    }
    if (!input.fullName.trim()) {
      throw new BadRequestException('fullName is required');
    }

    if (typeof fetch === 'undefined') {
      throw new BadRequestException('Fetch is not available for user provisioning');
    }

    const baseUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3001');
    const internalKey = this.configService.get<string>('AUTH_SERVICE_INTERNAL_KEY', '').trim();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (internalKey) {
      headers['x-internal-key'] = internalKey;
    }

    const response = await fetch(`${baseUrl}/api/v1/internal/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: normalizedEmail,
        fullName: input.fullName,
        identificationNumber: input.identificationNumber,
        userType: 'STUDENT',
        status: 'ACTIVE',
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      if (response.status !== 409 && response.status !== 400) {
        throw new BadRequestException(payload?.message || 'Failed to create student profile');
      }
    } else {
      const payload = (await response.json()) as { user?: UserSummary } | UserSummary;
      const created = payload && 'user' in payload && payload.user ? payload.user : (payload as UserSummary);
      if (created?.id) {
        return created;
      }
    }

    const existing = await this.fetchUserByEmail(normalizedEmail, headers, baseUrl);
    if (!existing) {
      throw new BadRequestException('Failed to resolve existing student profile');
    }
    if (existing.userType !== 'STUDENT') {
      throw new BadRequestException('Account already exists and is not a student');
    }
    if (existing.status !== 'ACTIVE') {
      throw new BadRequestException('Student account is not active');
    }
    return existing;
  }

  private async fetchUserByEmail(
    email: string,
    headers: Record<string, string>,
    baseUrl: string,
  ): Promise<UserSummary | null> {
    const response = await fetch(`${baseUrl}/api/v1/internal/users/email/${encodeURIComponent(email)}`, {
      headers,
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as UserSummary;
  }
}

