import { Body, Controller, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
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
import { TutoringService } from '../../application/sessions/tutoring.service';
import {
  AvailableSessionsQueryDto,
  AvailableSessionResponseDto,
  BookingResponseDto,
  BookingStatusDto,
  CancelSessionRequestDto,
  ReserveSessionRequestDto,
  SessionResponseDto,
  SessionStatusDto,
  TutoringModeDto,
} from './dto/session.dto';

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

@ApiTags('tutoring')
@Controller('tutoring')
export class SessionsController {
  constructor(private readonly tutoringService: TutoringService) {}

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

  @Get('sessions/available')
  @ApiOperation({ summary: 'List available tutoring slots' })
  @ApiOkResponse({ type: [AvailableSessionResponseDto] })
  async listAvailableSessions(
    @Query() query: AvailableSessionsQueryDto,
  ): Promise<AvailableSessionResponseDto[]> {
    return this.tutoringService.listAvailableSessions({
      teacherId: query.teacherId,
      startTimeFrom: query.startTimeFrom,
      startTimeTo: query.startTimeTo,
    });
  }

  @Post('sessions/reserve')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve a tutoring session (Student/Admin only)' })
  @ApiCreatedResponse({ type: BookingResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or slot unavailable' })
  @ApiUnauthorizedResponse({ description: 'Student or Admin role required' })
  async reserveSession(
    @Body() body: ReserveSessionRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<BookingResponseDto> {
    const context = this.createContext(request);
    const result = await this.tutoringService.reserveSession(
      {
        availabilitySlotId: body.availabilitySlotId,
        teacherId: body.teacherId,
        studentId: body.studentId,
        courseId: body.courseId,
        mode: body.mode,
        location: body.location,
        meetingUrl: body.meetingUrl,
      },
      context,
    );

    return {
      id: result.booking.id,
      tutoringSessionId: result.booking.tutoringSessionId,
      studentId: result.booking.studentId,
      status: result.booking.status as BookingStatusDto,
      reservedAt: result.booking.reservedAt,
    };
  }

  @Post('sessions/cancel')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a tutoring booking (Student/Admin only)' })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiUnauthorizedResponse({ description: 'Student or Admin role required' })
  async cancelSession(
    @Body() body: CancelSessionRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<BookingResponseDto> {
    const context = this.createContext(request);
    const booking = await this.tutoringService.cancelBooking({ bookingId: body.bookingId }, context);

    return {
      id: booking.id,
      tutoringSessionId: booking.tutoringSessionId,
      studentId: booking.studentId,
      status: booking.status as BookingStatusDto,
      reservedAt: booking.reservedAt,
    };
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get tutoring session by ID' })
  @ApiOkResponse({ type: SessionResponseDto })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async getSessionById(@Param('id') id: string): Promise<SessionResponseDto> {
    const result = await this.tutoringService.getSessionById(id);

    return {
      id: result.session.id,
      teacherId: result.session.teacherId,
      courseId: result.session.courseId,
      availabilitySlotId: result.session.availabilitySlotId,
      startTime: result.session.startTime,
      endTime: result.session.endTime,
      mode: result.session.mode as TutoringModeDto,
      location: result.session.location ?? null,
      meetingUrl: result.session.meetingUrl ?? null,
      status: result.session.status as SessionStatusDto,
      booking: result.booking
        ? {
            id: result.booking.id,
            tutoringSessionId: result.booking.tutoringSessionId,
            studentId: result.booking.studentId,
            status: result.booking.status as BookingStatusDto,
            reservedAt: result.booking.reservedAt,
          }
        : null,
    };
  }
}
