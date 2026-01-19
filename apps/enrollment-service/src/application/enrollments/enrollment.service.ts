import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { EnrollmentRepository } from './ports/enrollment.repository';

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');

type UserSummary = { id: string; status: 'ACTIVE' | 'SUSPENDED'; userType: 'STUDENT' | 'TEACHER' | 'ADMIN' };
type CourseSummary = { id: string; capacity: number; seatsTaken: number; status: 'OPEN' | 'CLOSED' };

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
    if (!teacherId || !input.actorRoles.includes('TEACHER')) {
      throw new UnauthorizedException('Teacher context is required');
    }

    const student = await this.fetchUser(input.studentId);
    if (!student || student.userType !== 'STUDENT' || student.status !== 'ACTIVE') {
      throw new BadRequestException('Student is not eligible for enrollment');
    }

    const course = await this.fetchCourse(input.courseId);
    if (!course || course.status !== 'OPEN') {
      throw new BadRequestException('Course is not open');
    }
    if (course.seatsTaken >= course.capacity) {
      throw new BadRequestException('Course has no available seats');
    }

    const enrollment = await this.enrollmentRepository.createEnrollment({
      studentId: input.studentId,
      courseId: input.courseId,
    });

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
}

