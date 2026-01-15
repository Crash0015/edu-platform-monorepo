import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.get<string>('MFA_ENCRYPTION_KEY', '');
    if (!rawKey) {
      throw new Error('MFA_ENCRYPTION_KEY is not configured');
    }

    this.key = this.parseKey(rawKey);
    if (this.key.length !== 32) {
      throw new Error('MFA_ENCRYPTION_KEY must be 32 bytes');
    }
  }

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
  }

  decrypt(value: string): string {
    const [ivPart, tagPart, dataPart] = value.split('.');
    if (!ivPart || !tagPart || !dataPart) {
      throw new Error('Invalid encrypted value');
    }

    const iv = Buffer.from(ivPart, 'base64');
    const tag = Buffer.from(tagPart, 'base64');
    const encrypted = Buffer.from(dataPart, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  private parseKey(rawKey: string): Buffer {
    const normalized = rawKey.trim();
    if (/^[0-9a-fA-F]{64}$/.test(normalized)) {
      return Buffer.from(normalized, 'hex');
    }
    return Buffer.from(normalized, 'base64');
  }
}
