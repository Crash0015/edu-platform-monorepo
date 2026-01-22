import { Injectable } from '@nestjs/common';
import { AvailabilityRepository, AvailabilityRecord } from '../../application/availability/ports/availability.repository';
import { AvailabilityStatus } from '../../domain/availability/availability-slot';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAvailability(input: {
    teacherId: string;
    courseId?: string | null;
    startTime: Date;
    endTime: Date;
    timezone: string;
    status: AvailabilityStatus;
    createdBy?: string | null;
  }): Promise<AvailabilityRecord> {
    const slot = await this.prisma.availabilitySlot.create({
      data: {
        teacherId: input.teacherId,
        courseId: input.courseId ?? null,
        startTime: input.startTime,
        endTime: input.endTime,
        timezone: input.timezone,
        status: input.status,
        createdBy: input.createdBy ?? null,
      },
    });

    return this.mapToRecord(slot);
  }

  async updateStatus(
    id: string,
    status: AvailabilityStatus,
    updatedBy?: string | null,
  ): Promise<AvailabilityRecord | null> {
    const slot = await this.prisma.availabilitySlot.update({
      where: { id },
      data: {
        status,
        updatedBy: updatedBy ?? null,
      },
    });

    return slot ? this.mapToRecord(slot) : null;
  }

  async updateAvailability(
    id: string,
    input: {
      courseId?: string | null;
      startTime: Date;
      endTime: Date;
      timezone: string;
      status: AvailabilityStatus;
      updatedBy?: string | null;
    },
  ): Promise<AvailabilityRecord | null> {
    const slot = await this.prisma.availabilitySlot.update({
      where: { id },
      data: {
        courseId: input.courseId ?? null,
        startTime: input.startTime,
        endTime: input.endTime,
        timezone: input.timezone,
        status: input.status,
        updatedBy: input.updatedBy ?? null,
      },
    });

    return slot ? this.mapToRecord(slot) : null;
  }

  async listByTeacher(
    teacherId: string,
    filters?: {
      startTimeFrom?: Date;
      startTimeTo?: Date;
      status?: AvailabilityStatus;
    },
  ): Promise<AvailabilityRecord[]> {
    const where: any = {
      teacherId,
      isDeleted: false,
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startTimeFrom || filters?.startTimeTo) {
      where.startTime = {
        ...(filters?.startTimeFrom ? { gte: filters.startTimeFrom } : null),
        ...(filters?.startTimeTo ? { lte: filters.startTimeTo } : null),
      };
    }

    const slots = await this.prisma.availabilitySlot.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return slots.map((slot) => this.mapToRecord(slot));
  }

  async listAll(
    filters?: {
      startTimeFrom?: Date;
      startTimeTo?: Date;
      status?: AvailabilityStatus;
    },
  ): Promise<AvailabilityRecord[]> {
    const where: any = {
      isDeleted: false,
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startTimeFrom || filters?.startTimeTo) {
      where.startTime = {
        ...(filters?.startTimeFrom ? { gte: filters.startTimeFrom } : null),
        ...(filters?.startTimeTo ? { lte: filters.startTimeTo } : null),
      };
    }

    const slots = await this.prisma.availabilitySlot.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return slots.map((slot) => this.mapToRecord(slot));
  }

  async findById(id: string): Promise<AvailabilityRecord | null> {
    const slot = await this.prisma.availabilitySlot.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    return slot ? this.mapToRecord(slot) : null;
  }

  async deleteAvailability(id: string, updatedBy?: string | null): Promise<boolean> {
    await this.prisma.availabilitySlot.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: updatedBy ?? null,
      },
    });

    return true;
  }

  async findOverlap(teacherId: string, startTime: Date, endTime: Date): Promise<AvailabilityRecord | null> {
    const slot = await this.prisma.availabilitySlot.findFirst({
      where: {
        teacherId,
        isDeleted: false,
        status: 'AVAILABLE',
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    return slot ? this.mapToRecord(slot) : null;
  }

  private mapToRecord(slot: any): AvailabilityRecord {
    return {
      id: slot.id,
      teacherId: slot.teacherId,
      courseId: slot.courseId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: slot.timezone,
      status: slot.status as AvailabilityStatus,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
      createdBy: slot.createdBy,
      updatedBy: slot.updatedBy,
    };
  }
}
