import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../../application/notifications/notification.service';
import { EnqueueEmailRequestDto, EnqueueEmailResponseDto } from './dto/notification.dto';

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
}
