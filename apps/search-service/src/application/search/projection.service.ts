import { Inject, Injectable } from '@nestjs/common';
import { EnrollmentProjection, ProjectionRepository } from './ports/projection.repository';

export const PROJECTION_REPOSITORY = Symbol('PROJECTION_REPOSITORY');

@Injectable()
export class ProjectionService {
  constructor(
    @Inject(PROJECTION_REPOSITORY)
    private readonly repository: ProjectionRepository,
  ) {}

  async applyEnrollmentCreated(input: EnrollmentProjection) {
    await this.repository.upsertEnrollment(input);
  }

  async getEnrollments(studentId: string) {
    return this.repository.findEnrollmentsByStudent(studentId);
  }
}
