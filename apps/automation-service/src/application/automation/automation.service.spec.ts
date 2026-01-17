import { AutomationService } from './automation.service';
import { AutomationMqtt, AutomationQueue } from './ports/automation.messaging';

describe('AutomationService', () => {
  it('publishes jobs and events', async () => {
    const queue: AutomationQueue = { publishJob: jest.fn() };
    const mqtt: AutomationMqtt = { publishEvent: jest.fn() };
    const service = new AutomationService(queue, mqtt);

    await service.publishJob({
      jobType: 'demo',
      payload: { message: 'hello' },
      correlationId: 'corr',
    });

    await service.publishEvent({
      eventType: 'automation.demo',
      payload: { message: 'hello' },
      correlationId: 'corr',
    });

    expect(queue.publishJob).toHaveBeenCalled();
    expect(mqtt.publishEvent).toHaveBeenCalled();
  });
});
