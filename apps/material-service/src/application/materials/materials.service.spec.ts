import { BadRequestException } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsClient } from './ports/materials.client';

describe('MaterialsService', () => {
  const client: MaterialsClient = {
    createMaterial: jest.fn(async (payload) => ({
      id: 'mat-1',
      title: String(payload.title),
      description: null,
      courseId: String(payload.courseId),
      type: payload.type as any,
      status: payload.status as any,
      resourceUrl: String(payload.resourceUrl),
      thumbnailUrl: null,
      durationMinutes: null,
      publishedAt: null,
    })),
    listMaterials: jest.fn(async () => []),
    getMaterial: jest.fn(async () => null),
    updateMaterial: jest.fn(async () => ({
      id: 'mat-1',
      title: 'test',
      description: null,
      courseId: 'course-1',
      type: 'PDF',
      status: 'DRAFT',
      resourceUrl: 'https://example.com/file.pdf',
      thumbnailUrl: null,
      durationMinutes: null,
      publishedAt: null,
    })),
    deleteMaterial: jest.fn(async () => undefined),
  };

  const kafkaService = {
    emit: jest.fn(),
  };

  const service = new MaterialsService(client, kafkaService as any);

  it('fails to publish if status stays draft', async () => {
    await expect(
      service.publishMaterial('mat-1', {
        correlationId: 'corr-1',
        actorUserId: 'teacher-1',
        actorRoles: ['TEACHER'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
