import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { NotificationPayload, NotificationQueue } from './ports/notification.queue';

export const NOTIFICATION_QUEUE = Symbol('NOTIFICATION_QUEUE');

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue: NotificationQueue,
    private readonly configService: ConfigService,
  ) {}

  async enqueueEmail(payload: NotificationPayload) {
    await this.queue.enqueueEmail(payload);
    return { message: 'Notification queued' };
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
      subject: payload.subject,
      text: payload.body,
    });

    this.logger.log(`Email sent to ${payload.to} (${payload.correlationId})`);
  }
}

