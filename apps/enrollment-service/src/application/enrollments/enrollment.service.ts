import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { EnrollmentRepository } from './ports/enrollment.repository';

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

  async getAllEnrollments(context: { actorUserId: string | null; actorRoles: string[] }) {
    if (!context.actorUserId || !context.actorRoles.includes('ADMIN')) {
      throw new UnauthorizedException('Admin role required');
    }

    const enrollments = await this.enrollmentRepository.getAllEnrollments();
    const enriched = await Promise.all(
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

    return enriched;
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
      const response = await fetch(`${baseUrl}/api/v1/courses/${courseId}`);
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as CourseSummary;
    } catch {
      return null;
    }
  }

  async getEnrollmentsByStudent(studentId: string, context: { actorUserId: string | null; actorRoles: string[] }) {
    // Allow if requesting own enrollments or if teacher/admin
    if (context.actorUserId !== studentId && !context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN')) {
      throw new UnauthorizedException('Not authorized to view these enrollments');
    }

    const enrollments = await this.enrollmentRepository.getEnrollmentsByStudent(studentId);
    
    // Fetch course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await this.fetchCourse(enrollment.courseId);
        return {
          ...enrollment,
          course: course || null,
        };
      }),
    );

    return enrollmentsWithCourses;
  }

  async getEnrollmentsByCourse(courseId: string, context: { actorUserId: string | null; actorRoles: string[] }) {
    // Only teachers and admins can view enrollments for a course
    if (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN')) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    const enrollments = await this.enrollmentRepository.getEnrollmentsByCourse(courseId);
    
    // Fetch student details for each enrollment
    const enrollmentsWithStudents = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await this.fetchUser(enrollment.studentId);
        return {
          ...enrollment,
          student: student || null,
        };
      }),
    );

    return enrollmentsWithStudents;
  }
}

