import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { EnrollmentService } from '../../application/enrollments/enrollment.service';
import { CreateEnrollmentRequestDto, EnrollmentResponseDto } from './dto/enrollment.dto';

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

  @Post('assign')
  @HttpCode(201)
  @ApiOperation({ summary: 'Assign student to course (teacher only)' })
  @ApiOkResponse({ type: EnrollmentResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async assign(
    @Body() body: CreateEnrollmentRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<EnrollmentResponseDto> {
    const actorUserId =
      request.user?.sub ?? getHeaderValue(request.headers['x-user-id']) ?? null;
    const rolesHeader = getHeaderValue(request.headers['x-user-roles']);
    const actorRoles = request.user?.roles ?? (rolesHeader ? rolesHeader.split(',') : []);
    return this.enrollmentService.assignEnrollment({
      studentId: body.studentId,
      courseId: body.courseId,
      correlationId: body.correlationId,
      actorUserId,
      actorRoles,
    });
  }

}
