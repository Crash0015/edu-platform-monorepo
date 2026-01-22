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

        let courseData = { code: '', name: 'Curso', description: '' };
        try {
          // Intentar obtener detalles del curso
          const courseServiceUrl = this.configService.get<string>('COURSE_SERVICE_URL', 'http://course-service:3004');
          if (typeof fetch !== 'undefined') {
            const res = await fetch(`${courseServiceUrl}/api/v1/courses/${event.payload.course_id}`);
            if (res.ok) {
              const course = (await res.json()) as { code: string; name: string; description: string };
              courseData = {
                code: course.code,
                name: course.name,
                description: course.description || '',
              };
            }
          }
        } catch (error) {
          // Ignorar error de fetch para no bloquear el proceso
          console.warn(`Failed to fetch course details for ${event.payload.course_id}`);
        }

        await this.projectionService.applyEnrollmentCreated({
          studentId: event.payload.student_id,
          courseId: event.payload.course_id,
          status: 'ACTIVE',
          course: {
            id: event.payload.course_id, // EXPLICIT ID SAVE
            code: courseData.code,
            name: courseData.name,
            description: courseData.description,
          },
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
