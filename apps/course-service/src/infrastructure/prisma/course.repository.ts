import { Injectable } from '@nestjs/common';
import { CourseRepository, CourseRecord, TeacherCourseRecord } from '../../application/courses/ports/course.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaCourseRepository implements CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(input: {
    code: string;
    name: string;
    description?: string;
    periodId?: string;
    capacity?: number;
    createdBy?: string;
  }): Promise<CourseRecord> {
    const course = await this.prisma.course.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description || null,
        periodId: input.periodId || null,
        capacity: input.capacity || 30,
        seatsTaken: 0,
        status: 'OPEN',
        createdBy: input.createdBy || null,
      },
    });

    return this.mapToCourseRecord(course);
  }

  async getCourseById(courseId: string): Promise<CourseRecord | null> {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        isDeleted: false,
      },
    });

    return course ? this.mapToCourseRecord(course) : null;
  }

  async getCourseByCode(code: string): Promise<CourseRecord | null> {
    const course = await this.prisma.course.findFirst({
      where: {
        code,
        isDeleted: false,
      },
    });

    return course ? this.mapToCourseRecord(course) : null;
  }

  async listCourses(filters?: { status?: string; periodId?: string }): Promise<CourseRecord[]> {
    const where: any = {
      isDeleted: false,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.periodId) {
      where.periodId = filters.periodId;
    }

    const courses = await this.prisma.course.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses.map((course) => this.mapToCourseRecord(course));
  }

  async getCoursesByTeacher(teacherId: string): Promise<CourseRecord[]> {
    const teacherCourses = await this.prisma.teacherCourse.findMany({
      where: {
        teacherId,
      },
      include: {
        course: true,
      },
    });

    return teacherCourses
      .filter((tc) => !tc.course.isDeleted)
      .map((tc) => this.mapToCourseRecord(tc.course));
  }

  async updateCourse(
    courseId: string,
    input: {
      name?: string;
      description?: string;
      status?: string;
      capacity?: number;
      updatedBy?: string;
    },
  ): Promise<CourseRecord | null> {
    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy;

    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    return this.mapToCourseRecord(course);
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return true;
  }

  async assignTeacher(input: {
    teacherId: string;
    courseId: string;
    roleInCourse?: 'OWNER' | 'ASSISTANT';
    createdBy?: string;
  }): Promise<TeacherCourseRecord> {
    const teacherCourse = await this.prisma.teacherCourse.create({
      data: {
        teacherId: input.teacherId,
        courseId: input.courseId,
        roleInCourse: input.roleInCourse || 'OWNER',
        createdBy: input.createdBy || null,
      },
    });

    return {
      id: teacherCourse.id,
      teacherId: teacherCourse.teacherId,
      courseId: teacherCourse.courseId,
      roleInCourse: teacherCourse.roleInCourse as 'OWNER' | 'ASSISTANT',
      createdAt: teacherCourse.createdAt,
      updatedAt: teacherCourse.updatedAt,
    };
  }

  async getTeachersByCourse(courseId: string): Promise<TeacherCourseRecord[]> {
    const teacherCourses = await this.prisma.teacherCourse.findMany({
      where: { courseId },
    });

    return teacherCourses.map((tc) => ({
      id: tc.id,
      teacherId: tc.teacherId,
      courseId: tc.courseId,
      roleInCourse: tc.roleInCourse as 'OWNER' | 'ASSISTANT',
      createdAt: tc.createdAt,
      updatedAt: tc.updatedAt,
    }));
  }

  async removeTeacherFromCourse(teacherId: string, courseId: string): Promise<boolean> {
    await this.prisma.teacherCourse.deleteMany({
      where: {
        teacherId,
        courseId,
      },
    });

    return true;
  }

  async incrementSeatsTaken(courseId: string): Promise<void> {
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        seatsTaken: {
          increment: 1,
        },
      },
    });
  }

  async decrementSeatsTaken(courseId: string): Promise<void> {
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        seatsTaken: {
          decrement: 1,
        },
      },
    });
  }

  private mapToCourseRecord(course: any): CourseRecord {
    return {
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description,
      periodId: course.periodId,
      status: course.status as CourseRecord['status'],
      capacity: course.capacity,
      seatsTaken: course.seatsTaken,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      createdBy: course.createdBy,
      updatedBy: course.updatedBy,
    };
  }
}
