import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { EnrollmentService } from '../../application/enrollments/enrollment.service';
import { EnrollmentQueryService } from '../../application/enrollments/queries/enrollment.query.service';
import {
  CreateEnrollmentRequestDto,
  CreateEnrollmentWithProfileRequestDto,
  EnrollmentAdminDto,
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
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly enrollmentQueryService: EnrollmentQueryService,
  ) {}

  private createContext(request: RequestWithUser): {
    actorUserId: string | null;
    actorRoles: string[];
  } {
    let actorUserId = request.user?.sub ?? getHeaderValue(request.headers['x-user-id']) ?? null;
    let actorRoles = request.user?.roles ?? [];

    if (!actorUserId || actorRoles.length === 0) {
      const authHeader = getHeaderValue(request.headers['authorization']);
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded: any = jwt.decode(token);
          if (decoded) {
            actorUserId = actorUserId || decoded.sub || null;
            if (actorRoles.length === 0 && decoded.roles && Array.isArray(decoded.roles)) {
              actorRoles = decoded.roles;
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (actorRoles.length === 0) {
      const rolesHeader = getHeaderValue(request.headers['x-user-roles']);
      if (rolesHeader) {
        actorRoles = rolesHeader.split(',');
      }
    }

    return {
      actorUserId,
      actorRoles,
    };
  }

  @Post('assign')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign student to course (teacher/admin)' })
  @ApiOkResponse({ type: EnrollmentResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
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

  @Post('assign-with-profile')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create student profile and assign to course (teacher/admin)' })
  @ApiOkResponse({ type: EnrollmentResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async assignWithProfile(
    @Body() body: CreateEnrollmentWithProfileRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<EnrollmentResponseDto> {
    const context = this.createContext(request);
    const correlationId = getHeaderValue(request.headers['x-correlation-id']) || this.generateUUID();

    return this.enrollmentService.assignEnrollmentWithProfile({
      email: body.email,
      fullName: body.fullName,
      identificationNumber: body.identificationNumber,
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
    const enrollments = await this.enrollmentQueryService.getEnrollmentsByStudent(studentId, context);
    return this.enrollmentService.buildEnrollmentCourseView(enrollments);
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
    const enrollments = await this.enrollmentQueryService.getEnrollmentsByCourse(courseId, context);
    return this.enrollmentService.buildEnrollmentStudentView(enrollments);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Drop enrollment (Teacher/Admin only)' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async dropEnrollment(@Param('id') id: string, @Req() request: RequestWithUser): Promise<void> {
    const context = this.createContext(request);
    await this.enrollmentService.dropEnrollment(id, context);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all enrollments (Admin only)' })
  @ApiOkResponse({ type: [EnrollmentAdminDto] })
  @ApiUnauthorizedResponse({ description: 'Admin role required' })
  async getAllEnrollments(@Req() request: RequestWithUser): Promise<EnrollmentAdminDto[]> {
    const context = this.createContext(request);
    const enrollments = await this.enrollmentQueryService.getAllEnrollments(context);
    return this.enrollmentService.buildEnrollmentAdminView(enrollments);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
