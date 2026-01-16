import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { ProjectionService } from '../../application/search/projection.service';

type EnrollmentCreatedPayload = {
  enrollment_id: string;
  student_id: string;
  course_id: string;
};

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private consumer?: Consumer;
  private enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly projectionService: ProjectionService,
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
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'search-service'),
      brokers: brokerList,
    });
    this.consumer = kafka.consumer({ groupId: 'search-service' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'enrollment.enrollment.created' });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }
        const event = JSON.parse(message.value.toString('utf8')) as {
          event_type: string;
          payload: EnrollmentCreatedPayload;
        };

        if (event.event_type !== 'enrollment.enrollment.created') {
          return;
        }

        await this.projectionService.applyEnrollmentCreated({
          studentId: event.payload.student_id,
          courseId: event.payload.course_id,
          status: 'ACTIVE',
        });
      },
    });
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.enabled) {
      return true;
    }
    return Boolean(this.consumer);
  }
}
