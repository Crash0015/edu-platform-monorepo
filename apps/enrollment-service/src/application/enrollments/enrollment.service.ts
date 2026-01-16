import { Inject, Injectable } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { EnrollmentRepository } from './ports/enrollment.repository';

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async createEnrollment(input: {
    studentId: string;
    courseId: string;
    correlationId: string;
    actorUserId: string | null;
  }) {
    const enrollment = await this.enrollmentRepository.createEnrollment({
      studentId: input.studentId,
      courseId: input.courseId,
    });

    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.ENROLLMENT_CREATED,
      correlationId: input.correlationId,
      actorUserId: input.actorUserId,
      payload: {
        enrollment_id: enrollment.id,
        student_id: enrollment.studentId,
        course_id: enrollment.courseId,
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return enrollment;
  }
}
