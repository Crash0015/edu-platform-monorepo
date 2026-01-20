import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AvailabilitySlot } from '../../domain/availability/availability-slot';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { AvailabilityRepository, AvailabilityRecord } from './ports/availability.repository';

export const AVAILABILITY_REPOSITORY = Symbol('AVAILABILITY_REPOSITORY');

type RequestContext = {
  correlationId: string;
  actorUserId: string | null;
  actorRoles: string[];
};

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async createAvailability(
    input: {
      teacherId: string;
      courseId?: string | null;
      startTime: string;
      endTime: string;
      timezone: string;
      status?: 'AVAILABLE' | 'BLOCKED';
    },
    context: RequestContext,
  ): Promise<AvailabilityRecord> {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }
    if (context.actorRoles.includes('TEACHER') && context.actorUserId !== input.teacherId) {
      throw new UnauthorizedException('Teachers can only manage their own availability');
    }

    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid start or end time');
    }

    const slot = AvailabilitySlot.create({
      teacherId: input.teacherId,
      courseId: input.courseId ?? null,
      startTime,
      endTime,
      timezone: input.timezone,
      status: input.status ?? 'AVAILABLE',
    });

    const overlap = await this.availabilityRepository.findOverlap(
      slot.teacherId,
      slot.startTime,
      slot.endTime,
    );

    if (overlap && slot.status === 'AVAILABLE') {
      throw new BadRequestException('Availability slot overlaps with an existing slot');
    }

    const created = await this.availabilityRepository.createAvailability({
      teacherId: slot.teacherId,
      courseId: slot.courseId ?? null,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: slot.timezone,
      status: slot.status,
      createdBy: context.actorUserId,
    });

    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.AVAILABILITY_CREATED,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      payload: {
        availability_id: created.id,
        teacher_id: created.teacherId,
        course_id: created.courseId ?? null,
        start_time: created.startTime.toISOString(),
        end_time: created.endTime.toISOString(),
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return created;
  }

  async listAvailabilityByTeacher(
    teacherId: string,
    filters?: {
      startTimeFrom?: string;
      startTimeTo?: string;
      status?: 'AVAILABLE' | 'BLOCKED';
    },
  ): Promise<AvailabilityRecord[]> {
    const startTimeFrom = filters?.startTimeFrom ? new Date(filters.startTimeFrom) : undefined;
    const startTimeTo = filters?.startTimeTo ? new Date(filters.startTimeTo) : undefined;

    if (startTimeFrom && Number.isNaN(startTimeFrom.getTime())) {
      throw new BadRequestException('Invalid startTimeFrom');
    }
    if (startTimeTo && Number.isNaN(startTimeTo.getTime())) {
      throw new BadRequestException('Invalid startTimeTo');
    }

    return this.availabilityRepository.listByTeacher(teacherId, {
      startTimeFrom,
      startTimeTo,
      status: filters?.status,
    });
  }

  async deleteAvailability(id: string, context: RequestContext): Promise<void> {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    const slot = await this.availabilityRepository.findById(id);
    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    if (context.actorRoles.includes('TEACHER') && slot.teacherId !== context.actorUserId) {
      throw new UnauthorizedException('Teachers can only manage their own availability');
    }

    await this.availabilityRepository.deleteAvailability(id, context.actorUserId);
  }
}
