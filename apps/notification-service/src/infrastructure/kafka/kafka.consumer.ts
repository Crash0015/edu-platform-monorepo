import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { NotificationService } from '../../application/notifications/notification.service';

type EnrollmentCreatedPayload = {
  enrollment_id: string;
  student_id: string;
  course_id: string;
  assigned_by: string;
};

type EnrollmentEvent = {
  event_type: string;
  correlation_id: string;
  payload: EnrollmentCreatedPayload;
};

@Injectable()
export class EnrollmentKafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EnrollmentKafkaConsumer.name);
  private consumer?: Consumer;
  private enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {
    this.enabled = this.configService.get<string>('KAFKA_ENABLED', 'true') !== 'false';
  }

  async onModuleInit() {
    if (!this.enabled) {
      return;
    }
    const brokers = this.configService.get<string>('KAFKA_BROKERS', '');
    const brokerList = brokers.split(',').map((broker) => broker.trim()).filter(Boolean);
    if (brokerList.length === 0) {
      return;
    }

    const kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'notification-service'),
      brokers: brokerList,
    });
    this.consumer = kafka.consumer({ groupId: 'notification-service' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'enrollment.enrollment.created' });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }
        const event = JSON.parse(message.value.toString('utf8')) as EnrollmentEvent;
        if (event.event_type !== 'enrollment.enrollment.created') {
          return;
        }

        await this.handleEnrollmentCreated(event);
      },
    });
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }

  private async handleEnrollmentCreated(event: EnrollmentEvent) {
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://user-service:3008');
    try {
      const response = await fetch(`${userServiceUrl}/api/v1/users/${event.payload.student_id}`);
      if (!response.ok) {
        this.logger.warn(`User not found for enrollment ${event.payload.enrollment_id}`);
        return;
      }
      const user = (await response.json()) as { email?: string };
      if (!user?.email) {
        this.logger.warn(`Missing email for enrollment ${event.payload.enrollment_id}`);
        return;
      }

      await this.notificationService.enqueueEmail({
        to: user.email,
        subject: 'Enrollment confirmed',
        body: `You have been enrolled in course ${event.payload.course_id}.`,
        correlationId: event.correlation_id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process enrollment email: ${message}`);
    }
  }
}
