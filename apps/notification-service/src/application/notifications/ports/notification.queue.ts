export type NotificationPayload = {
  to: string;
  subject: string;
  body: string;
  correlationId: string;
};

export interface NotificationQueue {
  enqueueEmail(payload: NotificationPayload): Promise<void>;
}
