import { EnrollmentService } from './enrollment.service';
import { EnrollmentRepository } from './ports/enrollment.repository';

describe('EnrollmentService', () => {
  it('assigns enrollment and emits event', async () => {
    const repository: EnrollmentRepository = {
      createEnrollment: jest.fn().mockResolvedValue({
        id: 'enrollment-id',
        studentId: '11111111-1111-1111-1111-111111111111',
        courseId: '22222222-2222-2222-2222-222222222222',
        status: 'ACTIVE',
      }),
    };
    const kafkaService = {
      emit: jest.fn(),
    };
    const configService = {
      get: jest.fn((_, fallback) => fallback),
    };

    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '11111111-1111-1111-1111-111111111111',
          status: 'ACTIVE',
          userType: 'STUDENT',
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '22222222-2222-2222-2222-222222222222',
          capacity: 30,
          seatsTaken: 10,
          status: 'OPEN',
        }),
      } as any);

    const service = new EnrollmentService(repository, kafkaService as any, configService as any);

    await service.assignEnrollment({
      studentId: '11111111-1111-1111-1111-111111111111',
      courseId: '22222222-2222-2222-2222-222222222222',
      correlationId: 'corr',
      actorUserId: 'teacher-1',
      actorRoles: ['TEACHER'],
    });

    expect(repository.createEnrollment).toHaveBeenCalled();
    expect(kafkaService.emit).toHaveBeenCalled();
    fetchMock.mockRestore();
  });

});
