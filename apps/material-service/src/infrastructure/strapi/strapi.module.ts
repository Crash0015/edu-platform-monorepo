import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StrapiClient } from './strapi.client';
import { MATERIALS_CLIENT } from '../../application/materials/materials.service';
import { MaterialConfig } from '../../shared/config/material-config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    {
      provide: MaterialConfig,
      useFactory: (configService: ConfigService) => MaterialConfig.getInstance(configService),
      inject: [ConfigService],
    },
    {
      provide: MATERIALS_CLIENT,
      useClass: StrapiClient,
    },
  ],
  exports: [MATERIALS_CLIENT, MaterialConfig],
})
export class StrapiModule {}
