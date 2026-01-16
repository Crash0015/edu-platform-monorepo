import { Injectable } from '@nestjs/common';
import { EnrollmentRepository, EnrollmentRecord } from '../../application/enrollments/ports/enrollment.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEnrollment(input: { studentId: string; courseId: string }): Promise<EnrollmentRecord> {
    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId: input.studentId,
        courseId: input.courseId,
      },
    });

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: enrollment.status as EnrollmentRecord['status'],
    };
  }
}
