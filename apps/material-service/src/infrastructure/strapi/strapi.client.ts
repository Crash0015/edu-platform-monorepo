import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MaterialConfig } from '../../shared/config/material-config';
import { MaterialRecord, MaterialsClient } from '../../application/materials/ports/materials.client';
import { MaterialStatus, MaterialType } from '../../domain/materials/material-types';

type StrapiResponse<T> = {
  data: {
    id: number | string;
    attributes: T;
  } | null;
};

type StrapiListResponse<T> = {
  data: Array<{
    id: number | string;
    attributes: T;
  }>;
};

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

  private mapRecord(item: { id: number | string; attributes: StrapiMaterialAttributes }): MaterialRecord {
    return {
      id: String(item.id),
      title: item.attributes.title,
      description: item.attributes.description ?? null,
      courseId: item.attributes.courseId,
      type: item.attributes.type,
      status: item.attributes.status,
      resourceUrl: item.attributes.resourceUrl,
      thumbnailUrl: item.attributes.thumbnailUrl ?? null,
      durationMinutes: item.attributes.durationMinutes ?? null,
      publishedAt: item.attributes.publishedAt ?? null,
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
