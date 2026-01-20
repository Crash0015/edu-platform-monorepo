import { Body, Controller, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { EnrollmentService } from '../../application/enrollments/enrollment.service';
import {
  CreateEnrollmentRequestDto,
  EnrollmentResponseDto,
  EnrollmentWithCourseDto,
  EnrollmentWithStudentDto,
} from './dto/enrollment.dto';

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: { sub?: string; roles?: string[] };
};

const getHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.join(',');
  }
  return value;
};

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  private createContext(request: RequestWithUser): {
    actorUserId: string | null;
    actorRoles: string[];
  } {
    const actorUserId = request.user?.sub ?? getHeaderValue(request.headers['x-user-id']) ?? null;
    const rolesHeader = getHeaderValue(request.headers['x-user-roles']);
    const actorRoles = request.user?.roles ?? (rolesHeader ? rolesHeader.split(',') : []);

    return {
      actorUserId,
      actorRoles,
    };
  }

  @Post('assign')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign student to course (teacher only)' })
  @ApiOkResponse({ type: EnrollmentResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Teacher role required' })
  async assign(
    @Body() body: CreateEnrollmentRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<EnrollmentResponseDto> {
    const context = this.createContext(request);
    const correlationId = getHeaderValue(request.headers['x-correlation-id']) || this.generateUUID();
    
    return this.enrollmentService.assignEnrollment({
      studentId: body.studentId,
      courseId: body.courseId,
      correlationId: body.correlationId || correlationId,
      actorUserId: context.actorUserId,
      actorRoles: context.actorRoles,
    });
  }

  @Get('students/:studentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all enrollments for a student (with course details)' })
  @ApiOkResponse({ type: [EnrollmentWithCourseDto] })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  async getEnrollmentsByStudent(
    @Param('studentId') studentId: string,
    @Req() request: RequestWithUser,
  ): Promise<EnrollmentWithCourseDto[]> {
    const context = this.createContext(request);
    return this.enrollmentService.getEnrollmentsByStudent(studentId, context);
  }

  @Get('courses/:courseId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all enrollments for a course (with student details) - Teacher/Admin only' })
  @ApiOkResponse({ type: [EnrollmentWithStudentDto] })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async getEnrollmentsByCourse(
    @Param('courseId') courseId: string,
    @Req() request: RequestWithUser,
  ): Promise<EnrollmentWithStudentDto[]> {
    const context = this.createContext(request);
    return this.enrollmentService.getEnrollmentsByCourse(courseId, context);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
