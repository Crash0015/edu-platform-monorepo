import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { MfaService } from '../../application/auth/ports/auth.security';
import { EncryptionService } from './encryption.service';

@Injectable()
export class OtpMfaService implements MfaService {
  private readonly issuer: string;

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {
    this.issuer = this.configService.get<string>('MFA_ISSUER', 'UCE Auth');
    authenticator.options = {
      step: 30,
      window: 1,
      digits: 6,
    };
  }

  async createSetup(email: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, this.issuer, secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    const encryptedSecret = this.encryptionService.encrypt(secret);

    return {
      secret,
      otpauthUrl,
      qrCodeDataUrl,
      encryptedSecret,
    };
  }

  verifyCode(encryptedSecret: string, code: string): boolean {
    const secret = this.encryptionService.decrypt(encryptedSecret);
    return authenticator.verify({ token: code, secret });
  }
}
