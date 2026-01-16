import { Injectable, OnModuleInit } from '@nestjs/common';
import { AutomationService } from '../../application/automation/automation.service';
import { RabbitMqService } from './rabbitmq.service';

const JOB_QUEUE = 'automation.jobs';

@Injectable()
export class AutomationConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly automationService: AutomationService,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.consume(JOB_QUEUE, async (payload) => {
      await this.automationService.handleJob(payload as any);
    });
  }
}
