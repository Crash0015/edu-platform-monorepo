import { BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityRepository } from './ports/availability.repository';

describe('AvailabilityService', () => {
  const kafkaService = {
    emit: jest.fn(),
  };

  const repository: AvailabilityRepository = {
    createAvailability: jest.fn(async (input) => ({
      id: 'slot-1',
      teacherId: input.teacherId,
      courseId: input.courseId ?? null,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone,
      status: input.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: input.createdBy ?? null,
      updatedBy: null,
    })),
    listByTeacher: jest.fn(async () => []),
    findById: jest.fn(async () => null),
    deleteAvailability: jest.fn(async () => true),
    findOverlap: jest.fn(async () => ({
      id: 'slot-overlap',
      teacherId: 'teacher-1',
      courseId: null,
      startTime: new Date('2026-01-20T10:00:00Z'),
      endTime: new Date('2026-01-20T11:00:00Z'),
      timezone: 'America/Guayaquil',
      status: 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      updatedBy: null,
    })),
  };

  const service = new AvailabilityService(repository, kafkaService as any);

  it('rejects overlapping availability slots', async () => {
    await expect(
      service.createAvailability(
        {
          teacherId: 'teacher-1',
          startTime: '2026-01-20T10:30:00Z',
          endTime: '2026-01-20T11:30:00Z',
          timezone: 'America/Guayaquil',
          status: 'AVAILABLE',
        },
        {
          actorUserId: 'teacher-1',
          actorRoles: ['TEACHER'],
          correlationId: 'corr-1',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
