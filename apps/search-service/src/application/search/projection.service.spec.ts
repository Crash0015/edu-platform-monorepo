import { ProjectionService } from './projection.service';
import { ProjectionRepository } from './ports/projection.repository';

describe('ProjectionService', () => {
  it('applies enrollment projections', async () => {
    const repository: ProjectionRepository = {
      upsertEnrollment: jest.fn(),
      findEnrollmentsByStudent: jest.fn().mockResolvedValue([]),
    };
    const service = new ProjectionService(repository);

    await service.applyEnrollmentCreated({
      studentId: 'student-id',
      courseId: 'course-id',
      status: 'ACTIVE',
    });

    expect(repository.upsertEnrollment).toHaveBeenCalled();
  });
});
