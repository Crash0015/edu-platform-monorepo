import { Injectable } from '@nestjs/common';
import { TutoringRepository, TutoringSessionRecord, BookingRecord } from '../../application/sessions/ports/tutoring.repository';
import { BookingStatus } from '../../domain/bookings/booking';
import { TutoringMode, TutoringSessionStatus } from '../../domain/sessions/tutoring-session';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTutoringRepository implements TutoringRepository {
  constructor(private readonly prisma: PrismaService) {}

  async reserveSession(input: {
    teacherId: string;
    courseId: string;
    availabilitySlotId: string;
    startTime: Date;
    endTime: Date;
    mode: TutoringMode;
    location?: string | null;
    meetingUrl?: string | null;
    studentId: string;
    createdBy?: string | null;
  }): Promise<{ session: TutoringSessionRecord; booking: BookingRecord; existingBooking: boolean }> {
    const result = await this.prisma.$transaction(async (tx) => {
      let session = await tx.tutoringSession.findUnique({
        where: { availabilitySlotId: input.availabilitySlotId },
      });

      if (!session) {
        session = await tx.tutoringSession.create({
          data: {
            teacherId: input.teacherId,
            courseId: input.courseId,
            availabilitySlotId: input.availabilitySlotId,
            startTime: input.startTime,
            endTime: input.endTime,
            mode: input.mode,
            location: input.location ?? null,
            meetingUrl: input.meetingUrl ?? null,
            status: 'OPEN',
            createdBy: input.createdBy ?? null,
          },
        });
      }

      let booking = await tx.booking.findUnique({
        where: { tutoringSessionId: session.id },
      });

      if (booking) {
        return {
          session: this.mapToSessionRecord(session),
          booking: this.mapToBookingRecord(booking),
          existingBooking: true,
        };
      }

      booking = await tx.booking.create({
        data: {
          tutoringSessionId: session.id,
          studentId: input.studentId,
          status: 'CONFIRMED',
          createdBy: input.createdBy ?? null,
        },
      });

      session = await tx.tutoringSession.update({
        where: { id: session.id },
        data: {
          status: 'RESERVED',
          updatedBy: input.createdBy ?? null,
        },
      });

      return {
        session: this.mapToSessionRecord(session),
        booking: this.mapToBookingRecord(booking),
        existingBooking: false,
      };
    });

    return result;
  }

  async findSessionById(id: string): Promise<TutoringSessionRecord | null> {
    const session = await this.prisma.tutoringSession.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    return session ? this.mapToSessionRecord(session) : null;
  }

  async findBookingBySessionId(sessionId: string): Promise<BookingRecord | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { tutoringSessionId: sessionId },
    });

    return booking ? this.mapToBookingRecord(booking) : null;
  }

  async findBookingById(id: string): Promise<BookingRecord | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    return booking ? this.mapToBookingRecord(booking) : null;
  }

  async cancelBooking(bookingId: string, updatedBy?: string | null): Promise<BookingRecord | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return null;
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        updatedBy: updatedBy ?? null,
      },
    });

    return this.mapToBookingRecord(updated);
  }

  async updateSessionStatus(sessionId: string, status: TutoringSessionStatus, updatedBy?: string | null): Promise<void> {
    await this.prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        status,
        updatedBy: updatedBy ?? null,
      },
    });
  }

  private mapToSessionRecord(session: any): TutoringSessionRecord {
    return {
      id: session.id,
      teacherId: session.teacherId,
      courseId: session.courseId,
      availabilitySlotId: session.availabilitySlotId,
      startTime: session.startTime,
      endTime: session.endTime,
      mode: session.mode as TutoringMode,
      location: session.location,
      meetingUrl: session.meetingUrl,
      status: session.status as TutoringSessionStatus,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      createdBy: session.createdBy,
      updatedBy: session.updatedBy,
    };
  }

  private mapToBookingRecord(booking: any): BookingRecord {
    return {
      id: booking.id,
      tutoringSessionId: booking.tutoringSessionId,
      studentId: booking.studentId,
      status: booking.status as BookingStatus,
      reservedAt: booking.reservedAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      createdBy: booking.createdBy,
      updatedBy: booking.updatedBy,
    };
  }
}
