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
    const courseServiceUrl = this.configService.get<string>('COURSE_SERVICE_URL', 'http://course-service:3004');
    try {
      if (typeof fetch === 'undefined') {
        this.logger.warn('Fetch is not available to resolve enrollment details');
        return;
      }
      const [userResponse, courseResponse] = await Promise.all([
        fetch(`${userServiceUrl}/api/v1/users/${event.payload.student_id}`),
        fetch(`${courseServiceUrl}/api/v1/courses/${event.payload.course_id}`),
      ]);
      if (!userResponse.ok) {
        this.logger.warn(`User not found for enrollment ${event.payload.enrollment_id}`);
        return;
      }
      const user = (await userResponse.json()) as { email?: string; fullName?: string | null };
      const course = courseResponse.ok ? ((await courseResponse.json()) as { code?: string; name?: string }) : null;
      if (!user?.email) {
        this.logger.warn(`Missing email for enrollment ${event.payload.enrollment_id}`);
        return;
      }

      const notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', '').trim();
      const correlationId = event.correlation_id;
      let teacherName = 'Docente';
      if (event.payload.assigned_by) {
        const teacherResponse = await fetch(`${userServiceUrl}/api/v1/users/${event.payload.assigned_by}`);
        if (teacherResponse.ok) {
          const teacher = (await teacherResponse.json()) as { fullName?: string | null; email?: string };
          teacherName = teacher.fullName || teacher.email || teacherName;
        }
      }

      await this.notificationService.enqueueEmail({
        to: user.email,
        subject: 'Matricula confirmada',
        body: `Hola ${user.fullName ?? 'estudiante'},\n\nHas sido matriculado en ${course?.code ? `${course.code} - ` : ''}${course?.name ?? 'el curso'} por ${teacherName}.\n\nPuedes ingresar a la plataforma para ver los detalles.`,
        correlationId,
      });

      if (notificationUrl) {
        const targetUrl = `${notificationUrl.replace(/\/$/, '')}/api/v1/notifications/internal`;
        await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: event.payload.student_id,
            title: 'Nueva matricula',
            body: `Te matriculo ${teacherName} en ${course?.code ? `${course.code} - ` : ''}${course?.name ?? 'el curso'}.`,
            metadata: {
              enrollmentId: event.payload.enrollment_id,
              courseId: event.payload.course_id,
              teacherId: event.payload.assigned_by,
            },
            correlationId,
          }),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process enrollment email: ${message}`);
    }
  }
}
