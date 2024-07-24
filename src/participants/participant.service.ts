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

  async getMany(group?: number, type?: string): Promise<Participant[]> {
    const queryBuilder =
      this.participantRepository.createQueryBuilder('participant');
    if (group) {
      queryBuilder.where('participant.group = :group', { group });
    }
    if (type) {
      queryBuilder.andWhere('participant.type = :type', { type });
    }
    return await queryBuilder.getMany();
  }

  async getOne(id: number) {
    const participant = await this.participantRepository.findOneBy({ id });

    if (!participant) throw new NotFoundException('El partcipante no existe');

    return participant;
  }

  async getByGroup(group: number, type: DrawType) {
    return await this.participantRepository.find({
      where: {
        group,
        type,
      },
    });
  }

  async createOne(dto: CreateParticipantDto) {
    const participant = this.participantRepository.create(dto);
    return await this.participantRepository.save(participant);
  }

  async editOne(id: number, dto: EditParticipantDto) {
    const participant = await this.participantRepository.findOneBy({ id });

    if (!participant) throw new NotFoundException('El partcipante no existe');

    const editedParticipant = Object.assign(participant, dto);
    return await this.participantRepository.save(editedParticipant);
  }

  async deleteOne(id: number) {
    return await this.participantRepository.delete(id);
  }
}
