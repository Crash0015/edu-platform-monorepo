import { BadRequestException } from '@nestjs/common';
import { TutoringService } from './tutoring.service';
import { TutoringRepository } from './ports/tutoring.repository';
import { ScheduleClient } from './ports/schedule.client';

describe('TutoringService', () => {
  const scheduleClient: ScheduleClient = {
    listAvailability: jest.fn(async () => [
      {
        id: 'slot-1',
        teacherId: 'teacher-1',
        courseId: 'course-1',
        startTime: '2026-01-20T10:00:00Z',
        endTime: '2026-01-20T11:00:00Z',
        timezone: 'America/Guayaquil',
        status: 'AVAILABLE',
      },
    ]),
  };

  const repository: TutoringRepository = {
    reserveSession: jest.fn(async () => ({
      session: {
        id: 'session-1',
        teacherId: 'teacher-1',
        courseId: 'course-1',
        availabilitySlotId: 'slot-1',
        startTime: new Date('2026-01-20T10:00:00Z'),
        endTime: new Date('2026-01-20T11:00:00Z'),
        mode: 'ONLINE',
        location: null,
        meetingUrl: null,
        status: 'RESERVED',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'student-1',
        updatedBy: null,
      },
      booking: {
        id: 'booking-1',
        tutoringSessionId: 'session-1',
        studentId: 'student-2',
        status: 'CONFIRMED',
        reservedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'student-2',
        updatedBy: null,
      },
      existingBooking: true,
    })),
    findSessionById: jest.fn(async () => null),
    findBookingBySessionId: jest.fn(async () => null),
    cancelBooking: jest.fn(async () => null),
    updateSessionStatus: jest.fn(async () => undefined),
  };

  const kafkaService = {
    emit: jest.fn(),
  };

  const service = new TutoringService(repository, scheduleClient, kafkaService as any);

  it('throws when slot already reserved by another student', async () => {
    await expect(
      service.reserveSession(
        {
          availabilitySlotId: 'slot-1',
          teacherId: 'teacher-1',
          studentId: 'student-1',
          courseId: 'course-1',
          mode: 'ONLINE',
        },
        {
          actorUserId: 'student-1',
          actorRoles: ['STUDENT'],
          correlationId: 'corr-1',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
