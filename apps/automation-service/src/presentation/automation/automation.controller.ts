import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AutomationService } from '../../application/automation/automation.service';
import {
  AutomationMessageResponseDto,
  AutomationPublishRequestDto,
  AutomationQueueRequestDto,
} from './dto/automation.dto';

@ApiTags('automation')
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('queue')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish automation job to RabbitMQ' })
  @ApiOkResponse({ type: AutomationMessageResponseDto })
  async queueJob(@Body() body: AutomationQueueRequestDto): Promise<AutomationMessageResponseDto> {
    return this.automationService.publishJob(body);
  }

  @Post('publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish automation event to MQTT' })
  @ApiOkResponse({ type: AutomationMessageResponseDto })
  async publishEvent(@Body() body: AutomationPublishRequestDto): Promise<AutomationMessageResponseDto> {
    return this.automationService.publishEvent(body);
  }
}
