import { AvailabilityStatus } from '../../../domain/availability/availability-slot';

export type AvailabilityRecord = {
  id: string;
  teacherId: string;
  courseId?: string | null;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: AvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export interface AvailabilityRepository {
  createAvailability(input: {
    teacherId: string;
    courseId?: string | null;
    startTime: Date;
    endTime: Date;
    timezone: string;
    status: AvailabilityStatus;
    createdBy?: string | null;
  }): Promise<AvailabilityRecord>;
  updateStatus(id: string, status: AvailabilityStatus, updatedBy?: string | null): Promise<AvailabilityRecord | null>;
  listAll(
    filters?: {
      startTimeFrom?: Date;
      startTimeTo?: Date;
      status?: AvailabilityStatus;
    },
  ): Promise<AvailabilityRecord[]>;
  listByTeacher(
    teacherId: string,
    filters?: {
      startTimeFrom?: Date;
      startTimeTo?: Date;
      status?: AvailabilityStatus;
    },
  ): Promise<AvailabilityRecord[]>;
  findById(id: string): Promise<AvailabilityRecord | null>;
  deleteAvailability(id: string, updatedBy?: string | null): Promise<boolean>;
  findOverlap(teacherId: string, startTime: Date, endTime: Date): Promise<AvailabilityRecord | null>;
}
