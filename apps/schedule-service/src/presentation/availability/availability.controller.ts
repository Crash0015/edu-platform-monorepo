import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AvailabilityService } from '../../application/availability/availability.service';
import {
  AvailabilityQueryDto,
  AvailabilityResponseDto,
  CreateAvailabilityRequestDto,
} from './dto/availability.dto';

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

@ApiTags('schedule')
@Controller('schedule')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

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
    const actorUserId = request.user?.sub || getHeaderValue(request.headers['x-user-id']) || null;
    const rolesHeader = getHeaderValue(request.headers['x-user-roles']);
    const actorRoles = request.user?.roles || (rolesHeader ? rolesHeader.split(',') : []);

    return { correlationId, actorUserId, actorRoles };
  }

  @Post('availability')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create availability slot (Teacher/Admin only)' })
  @ApiCreatedResponse({ type: AvailabilityResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or conflict detected' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async createAvailability(
    @Body() body: CreateAvailabilityRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<AvailabilityResponseDto> {
    const context = this.createContext(request);
    return this.availabilityService.createAvailability(
      {
        teacherId: body.teacherId,
        courseId: body.courseId,
        startTime: body.startTime,
        endTime: body.endTime,
        timezone: body.timezone,
        status: body.status,
      },
      context,
    ) as unknown as Promise<AvailabilityResponseDto>;
  }

  @Get('availability/teacher/:teacherId')
  @ApiOperation({ summary: 'List availability slots by teacher' })
  @ApiOkResponse({ type: [AvailabilityResponseDto] })
  async listAvailabilityByTeacher(
    @Param('teacherId') teacherId: string,
    @Query() query: AvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto[]> {
    return this.availabilityService.listAvailabilityByTeacher(teacherId, query) as unknown as Promise<AvailabilityResponseDto[]>;
  }

  @Delete('availability/:id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete availability slot (Teacher/Admin only)' })
  @ApiNotFoundResponse({ description: 'Availability slot not found' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async deleteAvailability(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<void> {
    const context = this.createContext(request);
    await this.availabilityService.deleteAvailability(id, context);
  }
}
