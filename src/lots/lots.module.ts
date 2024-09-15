import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from './entities/lot.entity';
import { LotService } from './lots.service';
import { LotController } from './lots.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lot])],
  controllers: [LotController],
  providers: [LotService],
  exports: [LotService],
})
export class LotModule {}
