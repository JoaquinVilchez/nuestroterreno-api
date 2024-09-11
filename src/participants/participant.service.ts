import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { EditParticipantDto } from './dto/edit-participant.dto';
import { Participant } from './entities/participant.entity';
import { DrawType } from './enums';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async getMany(group?: number, drawType?: string): Promise<Participant[]> {
    console.log(group, drawType);
    const queryBuilder =
      this.participantRepository.createQueryBuilder('participant');
    if (group) {
      queryBuilder.andWhere('lot.group = :group', { group });
    }
    if (drawType) {
      queryBuilder.andWhere('participant.drawType = :drawType', { drawType });
    }
    return await queryBuilder.getMany();
  }

  async getOne(id: number) {
    const participant = await this.participantRepository.findOneBy({ id });

    if (!participant) throw new NotFoundException('El partcipante no existe');

    return participant;
  }

  async getByGroup(group: number, drawType: DrawType) {
    return await this.participantRepository.find({
      where: {
        group,
        drawType,
      },
    });
  }

  async createOne(dto: CreateParticipantDto) {
    const participant = this.participantRepository.create(dto);
    return await this.participantRepository.save(participant);
  }

  async editOne(id: number, dto: EditParticipantDto) {
    const participant = await this.participantRepository.preload({
      id,
      ...dto,
    });

    if (!participant) throw new NotFoundException('El partcipante no existe');

    return await this.participantRepository.save(participant);
  }

  async deleteOne(id: number) {
    const participant = await this.participantRepository.findOneBy({ id });
    if (!participant) throw new NotFoundException('El participante no existe');

    return await this.participantRepository.delete(id);
  }
}
