export type AutomationMessage = {
  eventType: string;
  payload: Record<string, unknown>;
  correlationId: string;
};

export type AutomationJob = {
  jobType: string;
  payload: Record<string, unknown>;
  correlationId: string;
};

export interface AutomationQueue {
  publishJob(job: AutomationJob): Promise<void>;
}

export interface AutomationMqtt {
  publishEvent(message: AutomationMessage): Promise<void>;
}
