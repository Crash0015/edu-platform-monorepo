import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { TutoringService, TUTORING_REPOSITORY } from '../../application/sessions/tutoring.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { PrismaTutoringRepository } from '../../infrastructure/prisma/tutoring.repository';
import { HttpClientModule } from '../../infrastructure/http/http.module';

@Module({
  imports: [PrismaModule, KafkaModule, HttpClientModule],
  controllers: [SessionsController],
  providers: [
    TutoringService,
    {
      provide: TUTORING_REPOSITORY,
      useClass: PrismaTutoringRepository,
    },
  ],
})
export class SessionsModule {}
