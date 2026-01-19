import { CoursesService } from './courses.service';

describe('CoursesService', () => {
  it('returns a course summary when it exists', () => {
    const service = new CoursesService();
    const course = service.getCourse('22222222-2222-2222-2222-222222222222');

    expect(course).toEqual({
      id: '22222222-2222-2222-2222-222222222222',
      capacity: 30,
      seatsTaken: 10,
      status: 'OPEN',
    });
  });

  it('returns null when course is missing', () => {
    const service = new CoursesService();
    const course = service.getCourse('missing');

    expect(course).toBeNull();
  });
});
