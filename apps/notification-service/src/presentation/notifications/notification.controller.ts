import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../../application/notifications/notification.service';
import {
  CreateNotificationRequestDto,
  EnqueueEmailRequestDto,
  EnqueueEmailResponseDto,
  NotificationListResponseDto,
  NotificationRecordDto,
} from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Enqueue email notification' })
  @ApiOkResponse({ type: EnqueueEmailResponseDto })
  async enqueueEmail(@Body() body: EnqueueEmailRequestDto): Promise<EnqueueEmailResponseDto> {
    return this.notificationService.enqueueEmail(body);
  }

  @Post('internal')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create in-app notification (internal)' })
  @ApiOkResponse({ type: NotificationRecordDto })
  async createNotification(@Body() body: CreateNotificationRequestDto): Promise<NotificationRecordDto> {
    return this.notificationService.createNotification(body);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'List notifications for user' })
  @ApiOkResponse({ type: NotificationListResponseDto })
  async listNotifications(@Param('userId') userId: string): Promise<NotificationListResponseDto> {
    const items = await this.notificationService.listNotifications(userId);
    return { items };
  }

  @Post('users/:userId/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiOkResponse({ type: NotificationListResponseDto })
  async markAllRead(@Param('userId') userId: string): Promise<NotificationListResponseDto> {
    const items = await this.notificationService.markAllRead(userId);
    return { items };
  }
}
