import { Inject, Injectable, Logger } from '@nestjs/common';
import { AutomationJob, AutomationMessage, AutomationMqtt, AutomationQueue } from './ports/automation.messaging';

export const AUTOMATION_QUEUE = Symbol('AUTOMATION_QUEUE');
export const AUTOMATION_MQTT = Symbol('AUTOMATION_MQTT');

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @Inject(AUTOMATION_QUEUE)
    private readonly queue: AutomationQueue,
    @Inject(AUTOMATION_MQTT)
    private readonly mqtt: AutomationMqtt,
  ) {}

  async publishJob(job: AutomationJob) {
    await this.queue.publishJob(job);
    return { message: 'Queued' };
  }

  async publishEvent(message: AutomationMessage) {
    await this.mqtt.publishEvent(message);
    return { message: 'Published' };
  }

  async handleJob(job: AutomationJob) {
    this.logger.log(`Processing job ${job.jobType} (${job.correlationId})`);
  }
}
