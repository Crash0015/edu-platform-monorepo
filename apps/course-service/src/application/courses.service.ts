import { Injectable } from '@nestjs/common';

export interface CourseSummary {
  id: string;
  capacity: number;
  seatsTaken: number;
  status: 'OPEN' | 'CLOSED';
}

@Injectable()
export class CoursesService {
  private readonly courses = new Map<string, CourseSummary>();

  constructor() {
    this.courses.set('22222222-2222-2222-2222-222222222222', {
      id: '22222222-2222-2222-2222-222222222222',
      capacity: 30,
      seatsTaken: 10,
      status: 'OPEN',
    });
  }

  getCourse(courseId: string): CourseSummary | null {
    return this.courses.get(courseId) ?? null;
  }
}
