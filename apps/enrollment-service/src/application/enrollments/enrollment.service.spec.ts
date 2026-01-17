import { EnrollmentService } from './enrollment.service';
import { EnrollmentRepository } from './ports/enrollment.repository';

describe('EnrollmentService', () => {
  it('creates enrollment and emits event', async () => {
    const repository: EnrollmentRepository = {
      createEnrollment: jest.fn().mockResolvedValue({
        id: 'enrollment-id',
        studentId: 'student-id',
        courseId: 'course-id',
        status: 'ACTIVE',
      }),
    };
    const kafkaService = {
      emit: jest.fn(),
    };

    const service = new EnrollmentService(repository, kafkaService as any);

    await service.createEnrollment({
      studentId: 'student-id',
      courseId: 'course-id',
      correlationId: 'corr',
      actorUserId: null,
    });

    expect(repository.createEnrollment).toHaveBeenCalled();
    expect(kafkaService.emit).toHaveBeenCalled();
  });
});
