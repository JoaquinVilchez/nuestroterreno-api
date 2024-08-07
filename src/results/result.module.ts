import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';
import { Participant } from 'src/participants/entities/participant.entity';
import { Lot } from 'src/lots/entities/lot.entity';
import { LotService } from 'src/lots/lots.service';
import { ParticipantService } from 'src/participants/participant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Result, Participant, Lot])],
  controllers: [ResultController],
  providers: [ResultService, ParticipantService, LotService],
})
export class ResultModule {}
