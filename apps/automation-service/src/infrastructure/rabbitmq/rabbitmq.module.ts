import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqService } from './rabbitmq.service';
import { RabbitMqAutomationQueue } from './automation-queue.adapter';
import { AUTOMATION_QUEUE } from '../../application/automation/automation.service';

@Module({
  imports: [ConfigModule],
  providers: [
    RabbitMqService,
    RabbitMqAutomationQueue,
    {
      provide: AUTOMATION_QUEUE,
      useClass: RabbitMqAutomationQueue,
    },
  ],
  exports: [AUTOMATION_QUEUE, RabbitMqService],
})
export class RabbitMqModule {}
