import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { EnrollmentRepository } from '../ports/enrollment.repository';
import { ENROLLMENT_REPOSITORY } from '../enrollment.service';

@Injectable()
export class EnrollmentQueryService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository
  ) {}

  async getEnrollmentsByStudent(
    studentId: string,
    context: { actorUserId: string | null; actorRoles: string[] },
  ) {
    if (context.actorUserId !== studentId && !context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN')) {
      throw new UnauthorizedException('Not authorized to view these enrollments');
    }

    return this.enrollmentRepository.getEnrollmentsByStudent(studentId);
  }

  async getEnrollmentsByCourse(
    courseId: string,
    context: { actorUserId: string | null; actorRoles: string[] },
  ) {
    if (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN')) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    return this.enrollmentRepository.getEnrollmentsByCourse(courseId);
  }

  async getAllEnrollments(context: { actorUserId: string | null; actorRoles: string[] }) {
    if (!context.actorUserId || !context.actorRoles.includes('ADMIN')) {
      throw new UnauthorizedException('Admin role required');
    }

    return this.enrollmentRepository.getAllEnrollments();
  }
}
