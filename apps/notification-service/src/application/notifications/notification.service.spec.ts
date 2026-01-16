import { NotificationService } from './notification.service';
import { NotificationQueue } from './ports/notification.queue';

describe('NotificationService', () => {
  it('enqueues email notifications', async () => {
    const queue: NotificationQueue = {
      enqueueEmail: jest.fn(),
    };
    const service = new NotificationService(queue);

    const payload = {
      to: 'student@uce.edu.ec',
      subject: 'Hello',
      body: 'Test',
      correlationId: 'corr',
    };

    await service.enqueueEmail(payload);

    expect(queue.enqueueEmail).toHaveBeenCalledWith(payload);
  });
});
