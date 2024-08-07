import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';
import { Repository } from 'typeorm';
import {
  drawTypeCatalog,
  NumberOfDrawsCatalog,
  orderTypeValues,
  resultTypeCatalog,
  TranslateCatalog,
} from 'helpers/catalogs';
import { CreateResultDto } from './dto/create-result.dto';
import { EditResultDto } from './dto/edit-result.dto';
import { Lot } from 'src/lots/entities/lot.entity';
import { Participant } from 'src/participants/entities/participant.entity';
import { ParticipantService } from 'src/participants/participant.service';
import { LotService } from 'src/lots/lots.service';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    private readonly participantService: ParticipantService,
    private readonly lotService: LotService,
  ) {}

  async getMany(
    group?: number,
    resultType?: string,
    drawType?: string,
    quantity?: number,
    orderBy?: orderTypeValues,
    includeParticipants = false,
    includeLots = false,
  ): Promise<Result[]> {
    if (group !== undefined && typeof group !== 'number') {
      throw new BadRequestException('El parámetro "group" debe ser un número');
    }
    if (resultType !== undefined && typeof resultType !== 'string') {
      throw new BadRequestException(
        'El parámetro "resultType" debe ser una cadena de texto',
      );
    }
    if (drawType !== undefined && typeof drawType !== 'string') {
      throw new BadRequestException(
        'El parámetro "drawType" debe ser una cadena de texto',
      );
    }

    if (orderBy !== undefined && orderBy !== 'ASC' && orderBy !== 'DESC') {
      throw new BadRequestException(
        'El parámetro "orderBy" debe ser "ASC" o "DESC"',
      );
    }

    const conditions: any = {};
    if (group !== undefined) conditions['result.group'] = group;
    if (resultType !== undefined) conditions['result.result_type'] = resultType;
    if (drawType !== undefined) conditions['result.draw_type'] = drawType;

    const queryBuilder = this.resultRepository
      .createQueryBuilder('result')
      .where(conditions);

    if (includeParticipants) {
      queryBuilder.leftJoinAndSelect('result.participant', 'participants');
    }
    if (includeLots) {
      queryBuilder.leftJoinAndSelect('result.lot', 'lots');
    }

    if (orderBy !== undefined) {
      queryBuilder.orderBy('result.id', orderBy);
    }

    if (quantity !== undefined) {
      queryBuilder.take(quantity);
    }

    return await queryBuilder.getMany();
  }

  async getLastResult(): Promise<Result> {
    const result = await this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.lot', 'lot')
      .orderBy('result.id', 'DESC')
      .getOne();

    if (!result) {
      throw new NotFoundException('No se encontró el último resultado');
    }

    return result;
  }

  async getOne(id: number): Promise<Result> {
    const result = await this.resultRepository.findOne({
      where: { id },
      relations: ['lot', 'participant'],
    });

    if (!result) {
      throw new NotFoundException(`El resultado con ID ${id} no existe`);
    }

    return result;
  }

  async createOne(dto: CreateResultDto) {
    const participant = await this.participantService.getOne(dto.participant);
    if (!participant) {
      throw new NotFoundException(
        `Participant with ID ${dto.participant} not found`,
      );
    }

    const lot = dto.lot ? await this.lotService.getOneById(dto.lot) : null;
    if (dto.lot && !lot) {
      throw new NotFoundException(`Lot with ID ${dto.lot} not found`);
    }

    const result = this.resultRepository.create({
      ...dto,
      participant,
      lot,
    });

    return await this.resultRepository.save(result);
  }

  async editOne(id: number, dto: EditResultDto): Promise<Result> {
    const result = await this.resultRepository.findOneBy({ id });

    if (!result) {
      throw new NotFoundException(`El resultado con ID ${id} no existe`);
    }

    Object.assign(result, dto);
    return await this.resultRepository.save(result);
  }

  async deleteOne(id: number): Promise<void> {
    const result = await this.resultRepository.findOneBy({ id });

    if (!result) {
      throw new NotFoundException(`El resultado con ID ${id} no existe`);
    }

    await this.resultRepository.delete(id);
  }

  async getRegisteredWinners(
    group: number,
    resultType: string,
    drawType: string,
  ): Promise<Result[]> {
    if (!group || !resultType || !drawType) {
      throw new BadRequestException('Todos los parámetros son obligatorios');
    }

    const results = await this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.participant', 'participant')
      .where('participant.group = :group', { group })
      .andWhere('result.resultType = :resultType', { resultType })
      .andWhere('result.drawType = :drawType', { drawType })
      .getMany();

    if (results.length === 0) {
      throw new NotFoundException('No se encontraron resultados registrados');
    }

    return results;
  }

  async getByLot(lot: Lot): Promise<Result> {
    if (!lot) {
      throw new BadRequestException('El lote es obligatorio');
    }

    const result = await this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.lot', 'lot')
      .where('lot.id = :lotId', { lotId: lot.id })
      .getOne();

    if (!result) {
      throw new NotFoundException(
        `No se encontró resultado para el lote con ID ${lot.id}`,
      );
    }

    return result;
  }

  async getByParticipant(participant: Participant): Promise<Result> {
    if (!participant) {
      throw new BadRequestException('El participante es obligatorio');
    }

    const result = await this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.participant', 'participant')
      .where('participant.id = :participantId', {
        participantId: participant.id,
      })
      .getOne();

    if (!result) {
      throw new NotFoundException(
        `No se encontró resultado para el participante con ID ${participant.id}`,
      );
    }

    return result;
  }

  async validateResult(dto: CreateResultDto, isUpdate = false): Promise<void> {
    await this.validateRegisteredWinners(dto, isUpdate);
    await this.validateParticipant(dto);
    await this.validateParticipantWinner(dto, isUpdate);
    await this.validateLot(dto, isUpdate);
    await this.assignOrderNumber(dto, isUpdate);
  }

  private async validateRegisteredWinners(
    dto: CreateResultDto,
    isUpdate: boolean,
  ): Promise<void> {
    const registeredWinners = await this.getRegisteredWinners(
      dto.group,
      dto.resultType,
      dto.drawType,
    );
    const limitOfWinners = NumberOfDrawsCatalog[dto.drawType].find(
      (item) => item.group === dto.group,
    )[dto.resultType];

    if (registeredWinners.length >= limitOfWinners && !isUpdate) {
      throw new BadRequestException(
        `No se puede registrar más un ${TranslateCatalog[dto.resultType]} de tipo ${dto.drawType} en el grupo ${dto.group}`,
      );
    }
  }

  private async validateParticipant(dto: CreateResultDto): Promise<void> {
    const participant = await this.participantService.getOne(dto.participant);
    if (!participant) {
      throw new BadRequestException('El participante no existe');
    }

    if (participant.group !== dto.group) {
      throw new BadRequestException(
        `El participante seleccionado no pertenece al grupo ${dto.group}`,
      );
    }

    if (
      dto.drawType === drawTypeCatalog.CPD &&
      dto.drawType !== participant.type
    ) {
      throw new BadRequestException(
        `El participante debe ser del tipo ${dto.drawType}`,
      );
    }
  }

  private async validateParticipantWinner(
    dto: CreateResultDto,
    isUpdate: boolean,
  ): Promise<void> {
    const participant = await this.participantService.getOne(dto.participant);
    const isWinner = await this.getByParticipant(participant);
    if (isWinner && !isUpdate) {
      throw new BadRequestException(
        'El participante ya tiene un resultado asignado',
      );
    }
  }

  private async validateLot(
    dto: CreateResultDto,
    isUpdate: boolean,
  ): Promise<void> {
    if (dto.resultType === resultTypeCatalog.INCUMBENT) {
      if (!dto.lot) {
        throw new BadRequestException('Debes ingresar un lote');
      }

      const lot = await this.lotService.getOne(
        dto.lot,
        dto.group,
        dto.drawType,
      );

      if ((await this.getByLot(lot)) && !isUpdate) {
        throw new BadRequestException('El lote ya tiene un ganador asignado');
      }
    }
  }

  private async assignOrderNumber(
    dto: CreateResultDto,
    isUpdate: boolean,
  ): Promise<void> {
    if (dto.resultType === resultTypeCatalog.ALTERNATE && !isUpdate) {
      const registeredWinners = await this.getRegisteredWinners(
        dto.group,
        resultTypeCatalog.ALTERNATE,
        dto.drawType,
      );
      dto.orderNumber = registeredWinners.length + 1;
    }
  }
}
