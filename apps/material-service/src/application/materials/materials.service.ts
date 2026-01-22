import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MaterialFactory } from '../../domain/materials/material.factory';
import { MaterialStatus, MaterialType } from '../../domain/materials/material-types';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { buildEventEnvelope } from './event.factory';
import { MaterialsClient, MaterialRecord } from './ports/materials.client';

export const MATERIALS_CLIENT = Symbol('MATERIALS_CLIENT');

type RequestContext = {
  correlationId: string;
  actorUserId: string | null;
  actorRoles: string[];
};

@Injectable()
export class MaterialsService {
  constructor(
    @Inject(MATERIALS_CLIENT)
    private readonly materialsClient: MaterialsClient,
    private readonly kafkaService: KafkaService,
  ) {}

  async createMaterial(
    input: {
      title: string;
      description?: string;
      courseId: string;
      type: MaterialType;
      resourceUrl: string;
      thumbnailUrl?: string;
      durationMinutes?: number;
    },
    context: RequestContext,
  ): Promise<MaterialRecord> {
    this.ensureWriteAccess(context);

    const payload = MaterialFactory.createPayload({
      title: input.title,
      description: input.description,
      courseId: input.courseId,
      type: input.type,
      resourceUrl: input.resourceUrl,
      thumbnailUrl: input.thumbnailUrl,
      durationMinutes: input.durationMinutes,
      status: 'DRAFT',
    });

    if (input.type === 'VIDEO' && !payload.thumbnailUrl) {
      const generated = this.tryGenerateVideoThumbnail(input.resourceUrl);
      if (generated) {
        payload.thumbnailUrl = generated;
      }
    }

    return this.materialsClient.createMaterial(payload);
  }

  async listMaterials(filters?: { courseId?: string; status?: MaterialStatus; type?: MaterialType }) {
    return this.materialsClient.listMaterials(filters);
  }

  async getMaterial(id: string) {
    const material = await this.materialsClient.getMaterial(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    return material;
  }

  async updateMaterial(
    id: string,
    input: {
      title?: string;
      description?: string | null;
      type?: MaterialType;
      resourceUrl?: string;
      thumbnailUrl?: string | null;
      durationMinutes?: number | null;
      status?: MaterialStatus;
    },
    context: RequestContext,
  ) {
    this.ensureWriteAccess(context);

    const payload = { ...input } as Record<string, unknown> & { thumbnailUrl?: string | null; resourceUrl?: string };
    if (input.type === 'VIDEO' && !input.thumbnailUrl && input.resourceUrl) {
      const generated = this.tryGenerateVideoThumbnail(input.resourceUrl);
      if (generated) {
        payload.thumbnailUrl = generated;
      }
    }

    const updated = await this.materialsClient.updateMaterial(id, payload);
    if (!updated) {
      throw new NotFoundException('Material not found');
    }
    return updated;
  }

  async deleteMaterial(id: string, context: RequestContext): Promise<void> {
    this.ensureWriteAccess(context);
    await this.materialsClient.deleteMaterial(id);
  }

  async publishMaterial(id: string, context: RequestContext) {
    this.ensureWriteAccess(context);

    const material = await this.materialsClient.updateMaterial(id, {
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.status !== 'PUBLISHED') {
      throw new BadRequestException('Material could not be published');
    }

    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.MATERIAL_PUBLISHED,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      payload: {
        material_id: material.id,
        course_id: material.courseId,
        type: material.type,
      },
    });

    await this.kafkaService.emit(event.event_type, event);

    return material;
  }

  async uploadAsset(
    file: { buffer: Buffer; filename: string; mimetype: string },
    context: RequestContext,
  ): Promise<{ url: string }> {
    this.ensureWriteAccess(context);
    const url = await this.materialsClient.uploadAsset(file);
    return { url };
  }

  private ensureWriteAccess(context: RequestContext) {
    if (!context.actorUserId || (!context.actorRoles.includes('TEACHER') && !context.actorRoles.includes('ADMIN'))) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }
  }

  private tryGenerateVideoThumbnail(resourceUrl: string): string | null {
    if (!resourceUrl) {
      return null;
    }
    try {
      const url = new URL(resourceUrl);
      if (url.hostname.includes('youtube.com')) {
        const id = url.searchParams.get('v');
        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
      }
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace('/', '');
        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
      }
      if (url.hostname.includes('vimeo.com')) {
        return null;
      }
    } catch {
      return null;
    }
    return null;
  }
}
