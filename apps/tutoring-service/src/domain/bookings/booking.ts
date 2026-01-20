export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export class Booking {
  constructor(
    readonly tutoringSessionId: string,
    readonly studentId: string,
    readonly status: BookingStatus,
  ) {}

  static create(input: { tutoringSessionId: string; studentId: string; status?: BookingStatus }): Booking {
    return new Booking(input.tutoringSessionId, input.studentId, input.status ?? 'PENDING');
  }
}
