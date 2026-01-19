import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSecret, generateURI, verifySync } from 'otplib';
import type { Digits } from '@otplib/core';
import QRCode from 'qrcode';
import { MfaService } from '../../application/auth/ports/auth.security';
import { EncryptionService } from './encryption.service';

const OTP_DIGITS: Digits = 6;
const OTP_PERIOD = 30;
const OTP_STRATEGY = 'totp' as const;


@Injectable()
export class OtpMfaService implements MfaService {
  private readonly issuer: string;

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {
    this.issuer = this.configService.get<string>('MFA_ISSUER', 'UCE Auth');
  }


  async createSetup(email: string) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: this.issuer,
      label: email,
      secret,
      digits: OTP_DIGITS,
      period: OTP_PERIOD,
      strategy: OTP_STRATEGY,
    });
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
    return verifySync({
      secret,
      token: code,
      digits: OTP_DIGITS,
      period: OTP_PERIOD,
      strategy: OTP_STRATEGY,
      epochTolerance: 30,
    }).valid;
  }

}
