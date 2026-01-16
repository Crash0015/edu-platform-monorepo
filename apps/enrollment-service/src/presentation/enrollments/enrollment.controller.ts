import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from '../../application/enrollments/enrollment.service';
import { CreateEnrollmentRequestDto, EnrollmentResponseDto } from './dto/enrollment.dto';

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: { sub?: string };
};

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create enrollment' })
  @ApiOkResponse({ type: EnrollmentResponseDto })
  async create(
    @Body() body: CreateEnrollmentRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<EnrollmentResponseDto> {
    const actorUserId = request.user?.sub ?? null;
    return this.enrollmentService.createEnrollment({
      studentId: body.studentId,
      courseId: body.courseId,
      correlationId: body.correlationId,
      actorUserId,
    });
  }
}
