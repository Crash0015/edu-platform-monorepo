export type ScheduleAvailability = {
  id: string;
  teacherId: string;
  courseId?: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: 'AVAILABLE' | 'BLOCKED';
};

export interface ScheduleClient {
  listAvailability(teacherId: string, params?: {
    startTimeFrom?: string;
    startTimeTo?: string;
    status?: 'AVAILABLE' | 'BLOCKED';
  }): Promise<ScheduleAvailability[]>;
  updateAvailabilityStatus(
    availabilitySlotId: string,
    status: 'AVAILABLE' | 'BLOCKED',
    actor: { userId: string; roles: string[] },
  ): Promise<ScheduleAvailability>;
}
