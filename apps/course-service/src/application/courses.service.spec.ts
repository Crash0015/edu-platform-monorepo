import { UnauthorizedException } from '@nestjs/common';
import { CourseService } from './courses/course.service';
import { CourseRepository, CourseStatus, TeacherRoleInCourse } from './courses/ports/course.repository';

describe('CourseService', () => {
  const repository: CourseRepository = {
    createCourse: jest.fn(async (input) => ({
      id: 'course-1',
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      periodId: input.periodId ?? null,
      status: 'ACTIVE' as CourseStatus,
      capacity: input.capacity ?? 30,
      seatsTaken: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: input.createdBy ?? null,
      updatedBy: null,
    })),
    getCourseById: jest.fn(async () => null),
    getCourseByCode: jest.fn(async () => null),
    listCourses: jest.fn(async () => []),
    getCoursesByTeacher: jest.fn(async () => []),
    updateCourse: jest.fn(async () => null),
    deleteCourse: jest.fn(async () => true),
    assignTeacher: jest.fn(async () => ({
      id: 'tc-1',
      teacherId: 'teacher-1',
      courseId: 'course-1',
      roleInCourse: 'OWNER' as TeacherRoleInCourse,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getTeachersByCourse: jest.fn(async () => []),
    removeTeacherFromCourse: jest.fn(async () => true),
    incrementSeatsTaken: jest.fn(async () => undefined),
    decrementSeatsTaken: jest.fn(async () => undefined),
  };

  const kafkaService = {
    emit: jest.fn(),
  };

  const service = new CourseService(repository, kafkaService as any);

  it('creates a course when teacher context provided', async () => {
    const course = await service.createCourse(
      { code: 'MAT-101', name: 'Matematica', capacity: 30 },
      { correlationId: 'corr-1', actorUserId: 'teacher-1', actorRoles: ['TEACHER'] },
    );

    expect(course.code).toBe('MAT-101');
    expect(kafkaService.emit).toHaveBeenCalled();
  });

  it('rejects create when missing teacher role', async () => {
    await expect(
      service.createCourse(
        { code: 'MAT-102', name: 'Fisica' },
        { correlationId: 'corr-2', actorUserId: 'student-1', actorRoles: ['STUDENT'] },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
