import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectionService } from '../../application/search/projection.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly projectionService: ProjectionService) {}

  @Get('enrollments/:studentId')
  @ApiOperation({ summary: 'Get enrollment projections for a student' })
  @ApiOkResponse({
    schema: {
      example: {
        studentId: 'uuid',
        enrollments: [{ courseId: 'uuid', status: 'ACTIVE' }],
      },
    },
  })
  async getEnrollments(@Param('studentId') studentId: string) {
    const enrollments = await this.projectionService.getEnrollments(studentId);
    return {
      studentId,
      enrollments,
    };
  }
}
