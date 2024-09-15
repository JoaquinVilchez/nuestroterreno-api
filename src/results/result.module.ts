import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';
import { ResultGateway } from './result.gateway';
import { ParticipantModule } from 'src/participants/participant.module';
import { LotModule } from 'src/lots/lots.module';

@Module({
  imports: [TypeOrmModule.forFeature([Result]), ParticipantModule, LotModule],
  controllers: [ResultController],
  providers: [ResultService, ResultGateway],
})
export class ResultModule {}
