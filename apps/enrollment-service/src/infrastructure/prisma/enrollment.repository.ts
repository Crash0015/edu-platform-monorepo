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

    return this.mapToEnrollmentRecord(enrollment);
  }

  async getEnrollmentByStudentCourse(studentId: string, courseId: string): Promise<EnrollmentRecord | null> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        status: 'ACTIVE',
      },
    });

    return enrollment ? this.mapToEnrollmentRecord(enrollment) : null;
  }

  async getAllEnrollments(): Promise<EnrollmentRecord[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((enrollment) => this.mapToEnrollmentRecord(enrollment));
  }

  async getEnrollmentsByStudent(studentId: string): Promise<EnrollmentRecord[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        status: 'ACTIVE',
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments.map((e) => this.mapToEnrollmentRecord(e));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<EnrollmentRecord[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId,
        status: 'ACTIVE',
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments.map((e) => this.mapToEnrollmentRecord(e));
  }

  async getEnrollmentById(enrollmentId: string): Promise<EnrollmentRecord | null> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    return enrollment ? this.mapToEnrollmentRecord(enrollment) : null;
  }

  async dropEnrollment(enrollmentId: string): Promise<EnrollmentRecord | null> {
    const enrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'DROPPED' },
    });

    return enrollment ? this.mapToEnrollmentRecord(enrollment) : null;
  }

  private mapToEnrollmentRecord(enrollment: any): EnrollmentRecord {
    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: enrollment.status as EnrollmentRecord['status'],
      enrolledAt: enrollment.enrolledAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }
}
