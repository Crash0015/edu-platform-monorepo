import { BookingStatus } from '../../../domain/bookings/booking';
import { TutoringMode, TutoringSessionStatus } from '../../../domain/sessions/tutoring-session';

export type TutoringSessionRecord = {
  id: string;
  teacherId: string;
  courseId: string;
  availabilitySlotId: string;
  startTime: Date;
  endTime: Date;
  mode: TutoringMode;
  location?: string | null;
  meetingUrl?: string | null;
  status: TutoringSessionStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type BookingRecord = {
  id: string;
  tutoringSessionId: string;
  studentId: string;
  status: BookingStatus;
  reservedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export interface TutoringRepository {
  reserveSession(input: {
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
  }): Promise<{
    session: TutoringSessionRecord;
    booking: BookingRecord;
    existingBooking: boolean;
  }>;
  findSessionById(id: string): Promise<TutoringSessionRecord | null>;
  findBookingBySessionId(sessionId: string): Promise<BookingRecord | null>;
  findBookingById(id: string): Promise<BookingRecord | null>;
  cancelBooking(bookingId: string, updatedBy?: string | null): Promise<BookingRecord | null>;
  updateSessionStatus(sessionId: string, status: TutoringSessionStatus, updatedBy?: string | null): Promise<void>;
}
