import { MaterialStatus, MaterialType } from '../../../domain/materials/material-types';

export type MaterialRecord = {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  type: MaterialType;
  status: MaterialStatus;
  resourceUrl: string;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  publishedAt: string | null;
};

export interface MaterialsClient {
  createMaterial(payload: Record<string, unknown>): Promise<MaterialRecord>;
  listMaterials(filters?: { courseId?: string; status?: MaterialStatus; type?: MaterialType }): Promise<MaterialRecord[]>;
  getMaterial(id: string): Promise<MaterialRecord | null>;
  updateMaterial(id: string, payload: Record<string, unknown>): Promise<MaterialRecord | null>;
  deleteMaterial(id: string): Promise<void>;
  uploadAsset(file: { buffer: Buffer; filename: string; mimetype: string }): Promise<string>;
}
