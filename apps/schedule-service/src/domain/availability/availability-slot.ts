export type AvailabilityStatus = 'AVAILABLE' | 'BLOCKED';

export class AvailabilitySlot {
  constructor(
    readonly teacherId: string,
    readonly startTime: Date,
    readonly endTime: Date,
    readonly timezone: string,
    readonly status: AvailabilityStatus,
    readonly courseId?: string | null,
  ) {}

  static create(input: {
    teacherId: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    status: AvailabilityStatus;
    courseId?: string | null;
  }): AvailabilitySlot {
    if (input.endTime <= input.startTime) {
      throw new Error('End time must be after start time');
    }
    return new AvailabilitySlot(
      input.teacherId,
      input.startTime,
      input.endTime,
      input.timezone,
      input.status,
      input.courseId ?? null,
    );
  }

  overlaps(startTime: Date, endTime: Date): boolean {
    return this.startTime < endTime && this.endTime > startTime;
  }
}
