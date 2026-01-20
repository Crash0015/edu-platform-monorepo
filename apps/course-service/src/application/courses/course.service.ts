import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { CourseRepository, CourseRecord, TeacherCourseRecord, CourseStatus } from './ports/course.repository';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

type RequestContext = {
  correlationId: string;
  actorUserId: string | null;
  actorRoles: string[];
};

@Injectable()
export class CourseService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async createCourse(
    input: {
      code: string;
      name: string;
      description?: string;
      periodId?: string;
      capacity?: number;
    },
    context: RequestContext,
  ): Promise<CourseRecord> {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    // Check if code already exists
    const existingCourse = await this.courseRepository.getCourseByCode(input.code);
    if (existingCourse) {
      throw new BadRequestException('Course code already exists');
    }

    const course = await this.courseRepository.createCourse({
      ...input,
      createdBy: context.actorUserId,
    });

    // Emit event
    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.COURSE_CREATED,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      payload: {
        course_id: course.id,
        code: course.code,
        name: course.name,
        capacity: course.capacity,
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return course;
  }

  async getCourseById(courseId: string): Promise<CourseRecord> {
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async getCourseByCode(code: string): Promise<CourseRecord> {
    const course = await this.courseRepository.getCourseByCode(code);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async listCourses(filters?: { status?: string; periodId?: string }): Promise<CourseRecord[]> {
    return this.courseRepository.listCourses({
      ...filters,
      status: filters?.status as CourseStatus,
    });
  }

  async getCoursesByTeacher(teacherId: string, context: RequestContext): Promise<CourseRecord[]> {
    // Allow if requesting own courses or if admin
    if (context.actorUserId !== teacherId && !context.actorRoles.includes('ADMIN')) {
      throw new UnauthorizedException('Not authorized to view these courses');
    }

    return this.courseRepository.getCoursesByTeacher(teacherId);
  }

  async updateCourse(
    courseId: string,
    input: {
      name?: string;
      description?: string;
      status?: string;
      capacity?: number;
    },
    context: RequestContext,
  ): Promise<CourseRecord> {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    const existingCourse = await this.courseRepository.getCourseById(courseId);
    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    // Validate capacity
    if (input.capacity !== undefined && input.capacity < existingCourse.seatsTaken) {
      throw new BadRequestException('Capacity cannot be less than current enrolled students');
    }
    const updatedCourse = await this.courseRepository.updateCourse(courseId, {
      ...input,
      status: input.status ? (input.status as CourseStatus) : undefined,
      updatedBy: context.actorUserId,
    });

    if (!updatedCourse) {
      throw new NotFoundException('Course not found');
    }

    // Emit event
    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.COURSE_UPDATED,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      payload: {
        course_id: updatedCourse.id,
        changes: input,
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return updatedCourse;
  }

  async deleteCourse(courseId: string, context: RequestContext): Promise<void> {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.courseRepository.deleteCourse(courseId);

    // Emit event
    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.COURSE_DELETED,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      payload: {
        course_id: course.id,
        code: course.code,
      },
    });

    await this.kafkaService.emit(event.event_type, event);
  }

  async assignTeacher(
    input: {
      teacherId: string;
      courseId: string;
      roleInCourse?: 'OWNER' | 'ASSISTANT';
    },
    context: RequestContext,
  ): Promise<TeacherCourseRecord> {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    const course = await this.courseRepository.getCourseById(input.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const teacherCourse = await this.courseRepository.assignTeacher({
      ...input,
      createdBy: context.actorUserId,
    });

    // Emit event
    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.TEACHER_ASSIGNED,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      payload: {
        teacher_id: input.teacherId,
        course_id: input.courseId,
        role: input.roleInCourse || 'OWNER',
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return teacherCourse;
  }

  async getTeachersByCourse(courseId: string): Promise<TeacherCourseRecord[]> {
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.courseRepository.getTeachersByCourse(courseId);
  }

  async removeTeacherFromCourse(
    teacherId: string,
    courseId: string,
    context: RequestContext,
  ): Promise<void> {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }

    await this.courseRepository.removeTeacherFromCourse(teacherId, courseId);
  }
}
