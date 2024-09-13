import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLotDto } from './dto/create-lot.dto';
import { EditLotDto } from './dto/edit-lot.dto';
import { Lot } from './entities/lot.entity';
import { orderByTypes, orderTypeValues } from 'helpers/catalogs';

@Injectable()
export class LotService {
  constructor(
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,
  ) {}

  async getMany(
    group?: number,
    drawType?: string,
    quantity?: number,
    orderBy?: orderTypeValues,
  ): Promise<Lot[]> {
    const queryBuilder = this.lotRepository.createQueryBuilder('lot');

    if (group) {
      queryBuilder.andWhere('lot.group = :group', { group });
    }
    if (drawType) {
      queryBuilder.andWhere('lot.drawType = :drawType', { drawType });
    }
    if (quantity) {
      queryBuilder.take(quantity);
    }
    if (orderBy) {
      if (!orderByTypes.includes(orderBy)) {
        throw new BadRequestException(
          'El parámetro "orderBy" debe ser "ASC" o "DESC"',
        );
      }
      queryBuilder.orderBy('lot.id', orderBy);
    }

    // LEFT JOIN con la tabla Result para verificar si el lote está asignado
    queryBuilder.leftJoin('lot.result', 'result');

    // Filtrar solo los lotes que no tienen un resultado asignado (result.id IS NULL)
    queryBuilder.andWhere('result.id IS NULL');

    return await queryBuilder.getMany();
  }

  async getOne(id: number, group: number, drawType: string) {
    const lot = await this.lotRepository.findOne({
      where: {
        id: id,
        group: group,
        drawType: drawType,
      },
    });
    if (!lot)
      throw new NotFoundException(
        `No existe un lote con el id ${id}, el grupo ${group} y el tipo de sorteo ${drawType}`,
      );

    return lot;
  }

  async getOneById(id: number) {
    const lot = await this.lotRepository.findOneBy({ id });
    if (!lot) throw new NotFoundException('El lote no existe');

    return lot;
  }

  async createOne(dto: CreateLotDto) {
    const lot = this.lotRepository.create(dto);
    return await this.lotRepository.save(lot);
  }

  async editOne(id: number, dto: EditLotDto) {
    const lot = await this.lotRepository.preload({ id, ...dto });

    if (!lot) throw new NotFoundException('El lote no existe');

    return await this.lotRepository.save(lot);
  }

  async deleteOne(id: number) {
    const lot = await this.lotRepository.findOneBy({ id });
    if (!lot) throw new NotFoundException('El lote no existe');

    return await this.lotRepository.delete(id);
  }
}
