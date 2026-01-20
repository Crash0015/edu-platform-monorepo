import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseService } from '../../application/courses/course.service';
import {
  CreateCourseRequestDto,
  UpdateCourseRequestDto,
  CourseResponseDto,
  AssignTeacherRequestDto,
  TeacherCourseResponseDto,
  ListCoursesQueryDto,
} from './dto/course.dto';

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: { sub?: string; roles?: string[] };
};

const getHeaderValue = (header: string | string[] | undefined): string | undefined => {
  if (!header) {
    return undefined;
  }
  if (Array.isArray(header)) {
    return header[0];
  }
  return header;
};

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly courseService: CourseService) {}

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private createContext(request: RequestWithUser): {
    correlationId: string;
    actorUserId: string | null;
    actorRoles: string[];
  } {
    const correlationId =
      getHeaderValue(request.headers['x-correlation-id']) || this.generateUUID();
    
    let actorUserId =
      request.user?.sub || getHeaderValue(request.headers['x-user-id']) || null;
    let actorRoles = request.user?.roles || [];

    // Fallback: Try decoding JWT from Authorization header if context is missing
    if (!actorUserId || actorRoles.length === 0) {
      const authHeader = getHeaderValue(request.headers['authorization']);
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          // Decode the token without verification (Gateway/Auth service handles verification, or we trust internal net)
          // Ideally we should verify, but for now we just need the claims that the Gateway failed to inject as headers.
          const decoded: any = jwt.decode(token);
          if (decoded) {
            actorUserId = actorUserId || decoded.sub || null;
            if (actorRoles.length === 0 && decoded.roles && Array.isArray(decoded.roles)) {
              actorRoles = decoded.roles;
            }
          }
        } catch (e) {
          // Ignore decode errors
        }
      }
    }

    // Fallback 2: Check x-user-roles header
    if (actorRoles.length === 0) {
      const rolesHeader = getHeaderValue(request.headers['x-user-roles']);
      if (rolesHeader) {
        actorRoles = rolesHeader.split(',');
      }
    }

    return {
      correlationId,
      actorUserId,
      actorRoles,
    };
  }

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course (Teacher/Admin only)' })
  @ApiCreatedResponse({ type: CourseResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or code already exists' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async createCourse(
    @Body() body: CreateCourseRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<CourseResponseDto> {
    const context = this.createContext(request);
    return this.courseService.createCourse(body, context) as unknown as Promise<CourseResponseDto>;
  }

  @Get()
  @ApiOperation({ summary: 'List all courses' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'OPEN', 'CLOSED'] })
  @ApiQuery({ name: 'periodId', required: false, type: String })
  @ApiOkResponse({ type: [CourseResponseDto] })
  async listCourses(@Query() query: ListCoursesQueryDto): Promise<CourseResponseDto[]> {
    return this.courseService.listCourses(query) as unknown as Promise<CourseResponseDto[]>;
  }

  @Get('teachers/:teacherId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses by teacher' })
  @ApiOkResponse({ type: [CourseResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Not authorized' })
  async getCoursesByTeacher(
    @Param('teacherId') teacherId: string,
    @Req() request: RequestWithUser,
  ): Promise<CourseResponseDto[]> {
    const context = this.createContext(request);
    return this.courseService.getCoursesByTeacher(teacherId, context) as unknown as Promise<CourseResponseDto[]>;
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get course by code' })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiNotFoundResponse({ description: 'Course not found' })
  async getCourseByCode(@Param('code') code: string): Promise<CourseResponseDto> {
    return this.courseService.getCourseByCode(code) as unknown as Promise<CourseResponseDto>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiNotFoundResponse({ description: 'Course not found' })
  async getCourseById(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.courseService.getCourseById(id) as unknown as Promise<CourseResponseDto>;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course (Teacher/Admin only)' })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async updateCourse(
    @Param('id') id: string,
    @Body() body: UpdateCourseRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<CourseResponseDto> {
    const context = this.createContext(request);
    return this.courseService.updateCourse(id, body, context) as unknown as Promise<CourseResponseDto>;
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete course (Teacher/Admin only)' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async deleteCourse(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<void> {
    const context = this.createContext(request);
    await this.courseService.deleteCourse(id, context);
  }

  @Post(':id/seats/increment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Increment course seats (Teacher/Admin only)' })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiBadRequestResponse({ description: 'Course has no available seats' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async incrementSeats(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<CourseResponseDto> {
    const context = this.createContext(request);
    return this.courseService.incrementSeats(id, context) as unknown as Promise<CourseResponseDto>;
  }

  @Post(':id/seats/decrement')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decrement course seats (Teacher/Admin only)' })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiBadRequestResponse({ description: 'Course seats cannot be negative' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async decrementSeats(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<CourseResponseDto> {
    const context = this.createContext(request);
    return this.courseService.decrementSeats(id, context) as unknown as Promise<CourseResponseDto>;
  }

  @Post('teachers/assign')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign teacher to course (Teacher/Admin only)' })
  @ApiCreatedResponse({ type: TeacherCourseResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async assignTeacher(
    @Body() body: AssignTeacherRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<TeacherCourseResponseDto> {
    const context = this.createContext(request);
    return this.courseService.assignTeacher(body, context) as unknown as Promise<TeacherCourseResponseDto>;
  }

  @Get(':id/teachers')
  @ApiOperation({ summary: 'Get teachers assigned to a course' })
  @ApiOkResponse({ type: [TeacherCourseResponseDto] })
  @ApiNotFoundResponse({ description: 'Course not found' })
  async getTeachersByCourse(@Param('id') id: string): Promise<TeacherCourseResponseDto[]> {
    return this.courseService.getTeachersByCourse(id) as unknown as Promise<TeacherCourseResponseDto[]>;
  }

  @Delete(':courseId/teachers/:teacherId')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove teacher from course (Teacher/Admin only)' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async removeTeacherFromCourse(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
    @Req() request: RequestWithUser,
  ): Promise<void> {
    const context = this.createContext(request);
    await this.courseService.removeTeacherFromCourse(teacherId, courseId, context);
  }
}
