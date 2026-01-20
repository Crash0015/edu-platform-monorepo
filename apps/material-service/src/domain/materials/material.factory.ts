import { MaterialStatus, MaterialType } from './material-types';

type MaterialFactoryInput = {
  title: string;
  description?: string | null;
  courseId: string;
  type: MaterialType;
  resourceUrl: string;
  thumbnailUrl?: string | null;
  durationMinutes?: number | null;
  status?: MaterialStatus;
};

export class MaterialFactory {
  static createPayload(input: MaterialFactoryInput) {
    const base = {
      title: input.title,
      description: input.description ?? null,
      courseId: input.courseId,
      type: input.type,
      status: input.status ?? 'DRAFT',
      resourceUrl: input.resourceUrl,
      thumbnailUrl: input.thumbnailUrl ?? null,
      durationMinutes: input.durationMinutes ?? null,
    };

    if (input.type === 'PDF') {
      return {
        ...base,
        durationMinutes: null,
      };
    }

    if (input.type === 'LINK') {
      return {
        ...base,
        thumbnailUrl: null,
        durationMinutes: null,
      };
    }

    return base;
  }
}
