import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { NotificationPayload, NotificationQueue } from './ports/notification.queue';

export const NOTIFICATION_QUEUE = Symbol('NOTIFICATION_QUEUE');

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly notifications = new Map<string, Array<{ id: string; userId: string; title: string; body: string; read: boolean; createdAt: string }>>();

  constructor(
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue: NotificationQueue,
    private readonly configService: ConfigService,
  ) {}

  async enqueueEmail(payload: NotificationPayload) {
    await this.queue.enqueueEmail(payload);
    return { message: 'Notification queued' };
  }

  async createNotification(input: {
    userId: string;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
    correlationId: string;
  }) {
    void input.metadata;
    void input.correlationId;
    const record = {
      id: this.generateUUID(),
      userId: input.userId,
      title: input.title,
      body: input.body,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const existing = this.notifications.get(input.userId) || [];
    this.notifications.set(input.userId, [record, ...existing].slice(0, 50));
    return record;
  }

  async listNotifications(userId: string) {
    return this.notifications.get(userId) || [];
  }

  async markAllRead(userId: string) {
    const existing = this.notifications.get(userId) || [];
    const updated = existing.map((item) => ({ ...item, read: true }));
    this.notifications.set(userId, updated);
    return updated;
  }

  async handleEmail(payload: NotificationPayload) {
    const smtpUser = this.configService.get<string>('SMTP_USER', '');
    const smtpPass = this.configService.get<string>('SMTP_PASS', '');
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', ''),
      port: Number(this.configService.get<number | string>('SMTP_PORT', 587)),
      secure: false,
      ...(smtpUser && smtpPass
        ? {
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          }
        : {}),
    });

    const from = this.configService.get<string>('SMTP_FROM', 'UCE Platform <no-reply@uce.local>');
    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject || 'Notificacion',
      text: payload.body,
    });

    this.logger.log(`Email sent to ${payload.to} (${payload.correlationId})`);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
