import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { EditParticipantDto } from './dto/edit-participant.dto';
import { Participant } from './entities/participant.entity';
import { DrawType } from './enums';
import { Result } from 'src/results/entities/result.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async getMany(
    group?: number,
    drawType?: string,
    forSelect?: boolean,
  ): Promise<Participant[]> {
    const queryBuilder =
      this.participantRepository.createQueryBuilder('participant');

    // Filtrar por grupo (si existe)
    if (group) {
      queryBuilder.andWhere('participant.group = :group', { group });
    }

    if (forSelect) {
      // Filtro para el sorteo CPD
      if (drawType.toLowerCase() === DrawType.CPD) {
        queryBuilder.andWhere('participant.drawType = :drawType', { drawType });

        queryBuilder.leftJoin('participant.results', 'result');
        queryBuilder.leftJoin('result.lot', 'lot');

        // Excluir a los que ya tienen un lote asignado
        queryBuilder.andWhere('lot.id IS NULL');

        // Excluir a los que ya tienen un número de orden asignado en el CPD (grupo 1)
        queryBuilder.andWhere('result.order_number IS NULL');
      }
      // Filtro para el sorteo General
      else if (drawType.toLowerCase() === DrawType.GENERAL) {
        // Filtrar participantes que son del General o del CPD
        queryBuilder.andWhere(
          '(participant.drawType = :general OR participant.drawType = :cpd)',
          {
            general: DrawType.GENERAL,
            cpd: DrawType.CPD,
          },
        );

        // Excluir a los participantes que ya tienen un lote asignado en cualquier resultado
        queryBuilder.andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from(Result, 'r')
            .where('r.participant = participant.id')
            .andWhere('r.lot IS NOT NULL')
            .getQuery();
          return 'NOT EXISTS ' + subQuery;
        });

        // Hacer LEFT JOIN con resultados para las siguientes condiciones
        queryBuilder.leftJoin('participant.results', 'result');

        // Incluir a los suplentes del CPD y a quienes no han sido suplentes, pero excluir a los suplentes del General
        queryBuilder.andWhere(
          '(result.order_number IS NULL OR ' +
            '(result.drawType = :cpd AND result.group = :group AND result.order_number IS NOT NULL))',
          { group, cpd: DrawType.CPD },
        );

        // Excluir a los que ya han sido suplentes en General
        queryBuilder.andWhere(
          'NOT (result.drawType = :general AND result.group = :group AND result.order_number IS NOT NULL)',
          { group, general: DrawType.GENERAL },
        );

        // Excluir a los que ya han sido titulares en General
        queryBuilder.andWhere(
          'NOT (result.drawType = :general AND result.group = :group AND result.lot IS NOT NULL)',
          { group, general: DrawType.GENERAL },
        );
      }
    } else {
      if (drawType.toLowerCase() === DrawType.CPD) {
        queryBuilder.andWhere('participant.drawType = :drawType', { drawType });
      } else if (drawType.toLowerCase() === DrawType.GENERAL) {
        queryBuilder.andWhere('participant.drawType = :drawType', { drawType });
      }
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
