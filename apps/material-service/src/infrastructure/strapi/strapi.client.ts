import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialConfig } from '../../shared/config/material-config';
import { MaterialRecord, MaterialsClient } from '../../application/materials/ports/materials.client';
import { MaterialStatus, MaterialType } from '../../domain/materials/material-types';

type StrapiEntity<T> = {
  id: number | string;
  attributes?: T;
} & T;

type StrapiResponse<T> = {
  data: StrapiEntity<T> | null;
};

type StrapiListResponse<T> = {
  data: Array<StrapiEntity<T>>;
};

type StrapiUploadResponse = Array<{
  id: number;
  url: string;
}>;

type StrapiMaterialAttributes = {
  title: string;
  description?: string | null;
  courseId: string;
  type: MaterialType;
  status: MaterialStatus;
  resourceUrl: string;
  thumbnailUrl?: string | null;
  durationMinutes?: number | null;
  publishedAt?: string | null;
};

@Injectable()
export class StrapiClient implements MaterialsClient {
  constructor(private readonly httpService: HttpService, private readonly config: MaterialConfig) {}

  async createMaterial(payload: Record<string, unknown>): Promise<MaterialRecord> {
    const response = await this.post<StrapiResponse<StrapiMaterialAttributes>>('/materials', { data: payload });
    if (!response.data) {
      throw new Error('Strapi did not return a material');
    }
    return this.mapRecord(response.data);
  }

  async listMaterials(filters?: {
    courseId?: string;
    status?: MaterialStatus;
    type?: MaterialType;
  }): Promise<MaterialRecord[]> {
    const params: Record<string, string> = {};
    if (filters?.courseId) {
      params['filters[courseId][$eq]'] = filters.courseId;
    }
    if (filters?.status) {
      params['filters[status][$eq]'] = filters.status;
    }
    if (filters?.type) {
      params['filters[type][$eq]'] = filters.type;
    }

    const response = await this.get<StrapiListResponse<StrapiMaterialAttributes>>('/materials', params);
    return response.data.map((item) => this.mapRecord(item));
  }

  async getMaterial(id: string): Promise<MaterialRecord | null> {
    const response = await this.get<StrapiResponse<StrapiMaterialAttributes>>(`/materials/${id}`);
    if (!response.data) {
      return null;
    }
    return this.mapRecord(response.data);
  }

  async updateMaterial(id: string, payload: Record<string, unknown>): Promise<MaterialRecord | null> {
    const response = await this.put<StrapiResponse<StrapiMaterialAttributes>>(`/materials/${id}`, { data: payload });
    if (!response.data) {
      return null;
    }
    return this.mapRecord(response.data);
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.delete(`/materials/${id}`);
  }

  async uploadAsset(file: { buffer: Buffer; filename: string; mimetype: string }): Promise<string> {
    const baseUrl = this.config.strapiUrl;
    const boundary = `----edu-platform-${Date.now()}`;
    const payloadParts: Array<Buffer | string> = [
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="files"; filename="${file.filename}"\r\n` +
        `Content-Type: ${file.mimetype}\r\n\r\n`,
      file.buffer,
      `\r\n--${boundary}--\r\n`,
    ];
    const body = Buffer.concat(payloadParts.map((part) => (typeof part === 'string' ? Buffer.from(part) : part)));

    const response = await firstValueFrom(
      this.httpService.post(`${baseUrl}/api/upload`, body, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length,
        },
      }),
    );

    const payload = response.data as StrapiUploadResponse;
    if (!Array.isArray(payload) || payload.length === 0 || !payload[0]?.url) {
      throw new Error('Strapi did not return an uploaded asset');
    }

    const url = payload[0].url;
    if (url.startsWith('http')) {
      return url;
    }
    return `${baseUrl}${url}`;
  }

  private mapRecord(item: StrapiEntity<StrapiMaterialAttributes>): MaterialRecord {
    const attributes = item.attributes ?? item;
    return {
      id: String(item.id),
      title: attributes.title,
      description: attributes.description ?? null,
      courseId: attributes.courseId,
      type: attributes.type,
      status: attributes.status,
      resourceUrl: attributes.resourceUrl,
      thumbnailUrl: attributes.thumbnailUrl ?? null,
      durationMinutes: attributes.durationMinutes ?? null,
      publishedAt: attributes.publishedAt ?? null,
    };
  }

  private async get<T>(path: string, params: Record<string, string> = {}) {
    const baseUrl = this.config.strapiUrl;
    const response = await firstValueFrom(
      this.httpService.get(`${baseUrl}/api${path}`, {
        params,
        headers: this.getHeaders(),
      }),
    );
    return response.data as T;
  }

  private async post<T>(path: string, payload: Record<string, unknown>) {
    const baseUrl = this.config.strapiUrl;
    const response = await firstValueFrom(
      this.httpService.post(`${baseUrl}/api${path}`, payload, {
        headers: this.getHeaders(),
      }),
    );
    return response.data as T;
  }

  private async put<T>(path: string, payload: Record<string, unknown>) {
    const baseUrl = this.config.strapiUrl;
    const response = await firstValueFrom(
      this.httpService.put(`${baseUrl}/api${path}`, payload, {
        headers: this.getHeaders(),
      }),
    );
    return response.data as T;
  }

  private async delete(path: string) {
    const baseUrl = this.config.strapiUrl;
    await firstValueFrom(
      this.httpService.delete(`${baseUrl}/api${path}`, {
        headers: this.getHeaders(),
      }),
    );
  }

  private getHeaders() {
    const token = this.config.strapiToken;
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
