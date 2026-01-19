import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoursesService } from '../application/courses.service';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get course capacity summary' })
  @ApiOkResponse({ schema: { example: { id: 'uuid', capacity: 30, seatsTaken: 12, status: 'OPEN' } } })
  @ApiNotFoundResponse({ description: 'Course not found' })
  getCourse(@Param('id') id: string) {
    const course = this.coursesService.getCourse(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }
}
