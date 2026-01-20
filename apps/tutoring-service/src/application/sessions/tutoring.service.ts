import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TutoringSession } from '../../domain/sessions/tutoring-session';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { ScheduleClient } from './ports/schedule.client';
import { TutoringRepository, TutoringSessionRecord, BookingRecord } from './ports/tutoring.repository';

export const TUTORING_REPOSITORY = Symbol('TUTORING_REPOSITORY');
export const SCHEDULE_CLIENT = Symbol('SCHEDULE_CLIENT');

type RequestContext = {
  correlationId: string;
  actorUserId: string | null;
  actorRoles: string[];
};

@Injectable()
export class TutoringService {
  constructor(
    @Inject(TUTORING_REPOSITORY)
    private readonly tutoringRepository: TutoringRepository,
    @Inject(SCHEDULE_CLIENT)
    private readonly scheduleClient: ScheduleClient,
    private readonly kafkaService: KafkaService,
  ) {}

  async listAvailableSessions(input: {
    teacherId: string;
    startTimeFrom?: string;
    startTimeTo?: string;
  }): Promise<{
    id: string;
    teacherId: string;
    courseId: string | null;
    startTime: string;
    endTime: string;
    timezone: string;
  }[]> {
    const slots = await this.scheduleClient.listAvailability(input.teacherId, {
      startTimeFrom: input.startTimeFrom,
      startTimeTo: input.startTimeTo,
      status: 'AVAILABLE',
    });

    return slots.map((slot) => ({
      id: slot.id,
      teacherId: slot.teacherId,
      courseId: slot.courseId ?? null,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: slot.timezone,
    }));
  }

  async reserveSession(
    input: {
      availabilitySlotId: string;
      teacherId: string;
      studentId: string;
      courseId: string;
      startTime?: string;
      endTime?: string;
      mode: 'ONLINE' | 'IN_PERSON';
      location?: string;
      meetingUrl?: string;
    },
    context: RequestContext,
  ): Promise<{ session: TutoringSessionRecord; booking: BookingRecord }> {
    if (!context.actorUserId || (!context.actorRoles.includes('STUDENT') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Student or Admin role required');
    }
    if (context.actorRoles.includes('STUDENT') && context.actorUserId !== input.studentId) {
      throw new UnauthorizedException('Students can only reserve their own sessions');
    }

    const slots = await this.scheduleClient.listAvailability(input.teacherId, {
      status: 'AVAILABLE',
    });
    const slot = slots.find((item) => item.id === input.availabilitySlotId);
    if (!slot) {
      throw new BadRequestException('Availability slot not found');
    }

    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid availability slot times');
    }

    const session = TutoringSession.create({
      teacherId: input.teacherId,
      courseId: input.courseId,
      availabilitySlotId: input.availabilitySlotId,
      startTime,
      endTime,
      mode: input.mode,
      location: input.location,
      meetingUrl: input.meetingUrl,
    });

    const result = await this.tutoringRepository.reserveSession({
      teacherId: session.teacherId,
      courseId: session.courseId,
      availabilitySlotId: session.availabilitySlotId,
      startTime: session.startTime,
      endTime: session.endTime,
      mode: session.mode,
      location: session.location ?? null,
      meetingUrl: session.meetingUrl ?? null,
      studentId: input.studentId,
      createdBy: context.actorUserId,
    });

    if (result.booking.studentId !== input.studentId) {
      throw new BadRequestException('Availability slot already reserved');
    }

    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.SESSION_RESERVED,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      payload: {
        tutoring_session_id: result.session.id,
        student_id: result.booking.studentId,
        teacher_id: result.session.teacherId,
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return { session: result.session, booking: result.booking };
  }

  async cancelBooking(
    input: { bookingId: string },
    context: RequestContext,
  ): Promise<BookingRecord> {
    if (!context.actorUserId || (!context.actorRoles.includes('STUDENT') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Student or Admin role required');
    }

    const existingBooking = await this.tutoringRepository.findBookingById(input.bookingId);
    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }
    if (context.actorRoles.includes('STUDENT') && existingBooking.studentId !== context.actorUserId) {
      throw new UnauthorizedException('Students can only cancel their own bookings');
    }

    const booking = await this.tutoringRepository.cancelBooking(input.bookingId, context.actorUserId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.tutoringRepository.updateSessionStatus(booking.tutoringSessionId, 'OPEN', context.actorUserId);

    return booking;
  }

  async getSessionById(id: string): Promise<{ session: TutoringSessionRecord; booking: BookingRecord | null }> {
    const session = await this.tutoringRepository.findSessionById(id);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const booking = await this.tutoringRepository.findBookingBySessionId(session.id);

    return { session, booking };
  }
}
