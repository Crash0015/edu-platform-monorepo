export type TutoringSessionStatus = 'OPEN' | 'RESERVED' | 'CANCELLED' | 'DONE';
export type TutoringMode = 'ONLINE' | 'IN_PERSON';

export class TutoringSession {
  constructor(
    readonly teacherId: string,
    readonly courseId: string,
    readonly availabilitySlotId: string,
    readonly startTime: Date,
    readonly endTime: Date,
    readonly mode: TutoringMode,
    readonly status: TutoringSessionStatus,
    readonly location?: string | null,
    readonly meetingUrl?: string | null,
  ) {}

  static create(input: {
    teacherId: string;
    courseId: string;
    availabilitySlotId: string;
    startTime: Date;
    endTime: Date;
    mode: TutoringMode;
    status?: TutoringSessionStatus;
    location?: string | null;
    meetingUrl?: string | null;
  }): TutoringSession {
    if (input.endTime <= input.startTime) {
      throw new Error('End time must be after start time');
    }
    return new TutoringSession(
      input.teacherId,
      input.courseId,
      input.availabilitySlotId,
      input.startTime,
      input.endTime,
      input.mode,
      input.status ?? 'OPEN',
      input.location ?? null,
      input.meetingUrl ?? null,
    );
  }
}
