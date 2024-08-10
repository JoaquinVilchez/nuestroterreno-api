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
    includes: string[] = [],
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

    includes.forEach((include) => {
      queryBuilder.leftJoinAndSelect(`result.${include}`, include);
    });

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

    return result;
  }

  async validateResult(dto: CreateResultDto, isUpdate = false): Promise<void> {
    await this.validateRegisteredWinners(dto, isUpdate);
    await this.validateParticipant(dto);
    await this.validateParticipantWinner(dto, isUpdate);
    await this.validateLot(dto, isUpdate);
    await this.assignOrderNumber(dto, isUpdate);
  }

  /**
   * Valida si es posible registrar un nuevo resultado basado en las reglas de negocio definidas.
   *
   * La función verifica cuántos ganadores ya han sido registrados para un tipo de sorteo y grupo
   * específico. Utiliza esta información para determinar si se ha alcanzado el límite permitido
   * de ganadores para las condiciones dadas.
   *
   * @param {CreateResultDto} dto - Datos de entrada para la creación o actualización de un resultado,
   * que incluyen el grupo, tipo de resultado y tipo de sorteo.
   * @param {boolean} isUpdate - Indica si la operación actual es una actualización de un resultado existente.
   *
   * @throws {BadRequestException} Si ya se ha alcanzado el número máximo permitido de ganadores para
   * el tipo de resultado y grupo especificado y la operación no es una actualización.
   *
   * @returns {Promise<void>} No retorna ningún valor si la validación es exitosa; si falla, lanza una excepción.
   */
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

  /**
   * Valida la información del participante asociada con el resultado a registrar.
   *
   * Esta función realiza varias comprobaciones para asegurar que el participante
   * especificado en el DTO sea válido para el grupo y tipo de sorteo indicado.
   *
   * @param {CreateResultDto} dto - Datos de entrada para la creación de un resultado,
   * que incluyen el ID del participante, grupo, y tipo de sorteo.
   *
   * @throws {BadRequestException} Si el participante no existe, no pertenece al grupo especificado,
   * o si el tipo de sorteo requiere un tipo específico de participante que no coincide.
   *
   * @returns {Promise<void>} No retorna ningún valor si la validación es exitosa;
   * si falla, lanza una excepción indicando el error específico.
   */
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

  /**
   * Valida si el participante ya tiene un resultado asignado.
   *
   * Esta función comprueba si el participante especificado en el DTO ya ha sido
   * registrado previamente como ganador. Si el participante ya tiene un resultado
   * asignado y no se está realizando una actualización, lanza una excepción.
   *
   * @param {CreateResultDto} dto - Datos de entrada para la creación de un resultado,
   * que incluyen el ID del participante.
   * @param {boolean} isUpdate - Indica si la operación es una actualización. Si es true,
   * permite que el participante mantenga su resultado anterior.
   *
   * @throws {BadRequestException} Si el participante ya tiene un resultado asignado y
   * la operación no es una actualización.
   *
   * @returns {Promise<void>} No retorna ningún valor si la validación es exitosa;
   * si falla, lanza una excepción indicando que el participante ya tiene un resultado.
   */
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

  /**
   * Valida la información del lote asociado con el resultado a registrar.
   *
   * Esta función verifica si es necesario proporcionar un lote para el tipo de resultado
   * dado. Si el tipo de resultado es "INCUMBENT" y no se proporciona un lote,
   * lanza una excepción. También valida que el lote no tenga ya un ganador asignado,
   * a menos que la operación sea una actualización.
   *
   * @param {CreateResultDto} dto - Datos de entrada para la creación de un resultado,
   * que incluyen el ID del lote, el grupo y el tipo de sorteo.
   * @param {boolean} isUpdate - Indica si la operación es una actualización. Si es true,
   * permite que el lote mantenga su resultado anterior.
   *
   * @throws {BadRequestException} Si no se proporciona un lote cuando es necesario,
   * o si el lote ya tiene un ganador asignado y la operación no es una actualización.
   *
   * @returns {Promise<void>} No retorna ningún valor si la validación es exitosa;
   * si falla, lanza una excepción indicando el error específico.
   */
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

  /**
   * Asigna un número de orden para el resultado en función de los ganadores registrados.
   *
   * Esta función asigna un número de orden secuencial a los resultados de tipo "ALTERNATE" o suplentes.
   * Si no se está realizando una actualización, la función calcula cuántos ganadores
   * alternativos ya están registrados en el grupo y sorteo específicos, y asigna el siguiente
   * número de orden disponible.
   *
   * @param {CreateResultDto} dto - Datos de entrada para la creación de un resultado,
   * que incluyen el grupo y el tipo de sorteo.
   * @param {boolean} isUpdate - Indica si la operación es una actualización. Si es true,
   * no se recalcula el número de orden.
   *
   * @returns {Promise<void>} No retorna ningún valor si la operación es exitosa.
   * Si se trata de un resultado de tipo "ALTERNATE" y no es una actualización,
   * asigna el número de orden correspondiente.
   */
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
