import { Injectable } from '@nestjs/common';
import { AutomationJob, AutomationQueue } from '../../application/automation/ports/automation.messaging';
import { RabbitMqService } from './rabbitmq.service';

const JOB_QUEUE = 'automation.jobs';

@Injectable()
export class RabbitMqAutomationQueue implements AutomationQueue {
  constructor(private readonly rabbitMqService: RabbitMqService) {}

  async publishJob(job: AutomationJob): Promise<void> {
    await this.rabbitMqService.publish(JOB_QUEUE, job);
  }
}
