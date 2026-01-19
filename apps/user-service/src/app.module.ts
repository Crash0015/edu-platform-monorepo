import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './presentation/health.controller';
import { UsersController } from './presentation/users.controller';
import { UsersService } from './application/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [HealthController, UsersController],
  providers: [UsersService],
})
export class AppModule {}
