import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GrpcAuthController } from './grpc.controller';

@Module({
  imports: [AuthModule],
  controllers: [GrpcAuthController],
})
export class GrpcModule {}
