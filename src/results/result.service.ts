import {
  BadRequestException,
  forwardRef,
  Inject,
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
import { scheduledDraw } from 'helpers/catalogs';
import { ResultGateway } from './result.gateway';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    private readonly participantService: ParticipantService,
    private readonly lotService: LotService,
    @Inject(forwardRef(() => ResultGateway))
    private readonly resultGateway: ResultGateway, // Usa forwardRef para resolver la dependencia circular
  ) {}

  // Helper para manejar los retrasos
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async emitWebSocketEvents(result: any) {
    if (result.resultType.toLowerCase() === 'incumbent') {
      this.resultGateway.emitWinnerInfo('prompter', result);
      this.resultGateway.emitWinnerInfo('mainScreen', result);
      this.resultGateway.emitWinnerInfo('broadcast', result);

      await this.delay(10000);
      this.resultGateway.emitFullInfo('prompter');

      await this.delay(10000);
      this.resultGateway.emitDefaultPage('mainScreen');
      this.resultGateway.emitLastResults('broadcast', {
        group: result.group,
        resultType: result.resultType.toLowerCase(),
        drawType: result.drawType.toLowerCase(),
        quantity: 3,
      });

      await this.delay(20000);
      this.resultGateway.emitLastResults('mainScreen', {
        group: result.group,
        resultType: result.resultType.toLowerCase(),
        drawType: result.drawType.toLowerCase(),
        quantity: 5,
      });

      await this.delay(10000);
      this.resultGateway.emitNextDraw('mainScreen');
      this.resultGateway.emitNextDraw('broadcast');
    } else {
      this.resultGateway.emitWinnerInfo('prompter', result);
      this.resultGateway.emitLastResults('mainScreen', {
        group: result.group,
        resultType: result.resultType.toLowerCase(),
        drawType: result.drawType.toLowerCase(),
        quantity: 5,
      });
      this.resultGateway.emitLastResults('broadcast', {
        group: result.group,
        resultType: result.resultType.toLowerCase(),
        drawType: result.drawType.toLowerCase(),
        quantity: 3,
      });

      await this.delay(10000);
      this.resultGateway.emitFullInfo('prompter');
    }
  }

  async countResults(): Promise<number> {
    return this.resultRepository.count();
  }

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
    if (group !== undefined) conditions['group'] = group;
    if (resultType !== undefined)
      conditions['resultType'] = resultType.toLowerCase();
    if (drawType !== undefined) conditions['drawType'] = drawType.toLowerCase();

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

    let lot = null;
    if (dto.resultType.toLowerCase() === 'incumbent') {
      lot = dto.lot ? await this.lotService.getOneById(dto.lot) : null;
    }

    const result = this.resultRepository.create({
      ...dto,
      participant,
      lot,
    });

    try {
      const savedResult = await this.resultRepository.save(result);
      if (savedResult) {
        this.emitWebSocketEvents(savedResult);
      }
      return savedResult;
    } catch (error) {
      console.error('Error al registrar el resultado:', error);
      throw error;
    }
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

    try {
      const savedResult = await this.resultRepository.delete(id);
      if (savedResult) {
        // Llama al método público del gateway para emitir el evento 'nextDraw'
        this.resultGateway.emitFullInfo('prompter');
      }
    } catch (error) {
      console.error('Error al registrar el resultado:', error);
      throw error;
    }
  }

  /**
   * Obtiene el último resultado registrado en la base de datos.
   *
   * Esta función utiliza un query builder para seleccionar el último resultado
   * registrado en la tabla `result`, realizando un LEFT JOIN con la tabla `lot`
   * para incluir la información del lote asociado. Los resultados se ordenan
   * en orden descendente por el campo `id`, asegurando que se obtenga el más reciente.
   * Si no se encuentra ningún resultado, se lanza una excepción.
   *
   * @throws {NotFoundException} Si no se encuentra ningún resultado registrado.
   *
   * @returns {Promise<Result>} Retorna el último resultado encontrado, incluyendo
   * la información del lote asociado.
   */
  async getLastResult(): Promise<Result> {
    const result = await this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.lot', 'lot')
      .leftJoinAndSelect('result.participant', 'participant')
      .orderBy('result.id', 'DESC')
      .getOne();

    if (!result) {
      throw new NotFoundException('No se encontró el último resultado');
    }

    return result;
  }

  /**
   * Obtiene los resultados registrados que cumplen con los parámetros especificados.
   *
   * Esta función recibe como parámetros el grupo, el tipo de resultado, y el tipo
   * de sorteo. Utiliza un query builder para buscar en la tabla `result` aquellos
   * registros que coinciden con estos parámetros, realizando un LEFT JOIN con la
   * tabla `participant` para incluir la información del participante asociado.
   * Si alguno de los parámetros no es proporcionado, lanza una excepción.
   *
   * @param {number} group - El grupo al que pertenece el participante.
   * @param {string} resultType - El tipo de resultado a buscar.
   * @param {string} drawType - El tipo de sorteo a buscar.
   *
   * @throws {BadRequestException} Si alguno de los parámetros obligatorios no es proporcionado.
   *
   * @returns {Promise<Result[]>} Retorna un array de resultados que coinciden con los parámetros
   * especificados, incluyendo la información del participante asociado.
   */
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

  /**
   * Obtiene un resultado específico basado en el lote proporcionado.
   *
   * Esta función recibe un objeto `Lot` como parámetro y utiliza un query builder
   * para buscar en la tabla `result` el registro que está asociado con ese lote.
   * Si el lote no es proporcionado, lanza una excepción.
   *
   * @param {Lot} lot - El lote por el cual se desea buscar un resultado.
   *
   * @throws {BadRequestException} Si el lote no es proporcionado.
   *
   * @returns {Promise<Result>} Retorna el resultado asociado con el lote proporcionado.
   */
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

  /**
   * Obtiene un resultado específico basado en el participante proporcionado.
   *
   * Esta función recibe un objeto `Participant` como parámetro y utiliza un query builder
   * para buscar en la tabla `result` el registro que está asociado con ese participante.
   * Si el participante no es proporcionado, lanza una excepción.
   *
   * @param {Participant} participant - El participante por el cual se desea buscar un resultado.
   *
   * @throws {BadRequestException} Si el participante no es proporcionado.
   *
   * @returns {Promise<Result>} Retorna el resultado asociado con el participante proporcionado.
   */
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

  /**
   * Valida los datos de un resultado antes de su registro o actualización.
   *
   * Esta función realiza varias validaciones sobre los datos proporcionados en el DTO
   * de creación de resultados, como verificar si ya existen ganadores registrados para
   * el participante, si el participante es válido, si ya es un ganador registrado, y
   * si el lote asociado es válido. También se asigna un número de orden si es necesario.
   *
   * @param {CreateResultDto} dto - Datos de entrada para la creación de un resultado,
   * que incluyen información del participante, lote, tipo de resultado, etc.
   * @param {boolean} [isUpdate=false] - Indica si la operación es una actualización. Si es true,
   * algunas validaciones permitirán mantener ciertos datos anteriores.
   *
   * @returns {Promise<void>} No retorna ningún valor si la validación es exitosa;
   * si falla, lanza una excepción indicando el error específico.
   */
  async validateResult(dto: CreateResultDto, isUpdate = false): Promise<void> {
    await this.validateRegisteredWinners(dto, isUpdate);
    await this.validateParticipant(dto);
    await this.validateParticipantWinner(dto, isUpdate);

    if (dto.resultType.toLowerCase() === 'incumbent') {
      await this.validateLot(dto, isUpdate);
    }
    if (dto.resultType.toLowerCase() === 'alternate') {
      await this.assignOrderNumber(dto, isUpdate);
    }
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
      dto.resultType.toLowerCase(),
      dto.drawType.toLowerCase(),
    );

    const limitOfWinners = NumberOfDrawsCatalog[dto.drawType].find(
      (item) => item.group === dto.group,
    )[dto.resultType];

    if (registeredWinners.length >= limitOfWinners && !isUpdate) {
      throw new BadRequestException(
        `No se puede registrar más un ${TranslateCatalog[dto.resultType.toLowerCase()]} de tipo ${dto.drawType.toLowerCase()} en el grupo ${dto.group}`,
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
      dto.drawType.toLowerCase() === drawTypeCatalog.CPD &&
      dto.drawType.toLowerCase() !== participant.drawType.toLowerCase()
    ) {
      throw new BadRequestException(
        `El participante debe ser del tipo ${dto.drawType.toLowerCase()}`,
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

    // Busca si el participante ya tiene algún resultado asignado
    const existingResult = await this.getByParticipant(participant);

    // Si el participante ya tiene un resultado y no se trata de una actualización
    if (existingResult && !isUpdate) {
      // Verifica si el participante tiene un resultado como titular en el mismo grupo
      if (
        existingResult.resultType.toLowerCase() === 'incumbent' &&
        existingResult.group === dto.group
      ) {
        throw new BadRequestException(
          'El participante ya tiene un resultado como titular en este grupo',
        );
      }

      // Si el participante tiene un resultado como suplente en el mismo grupo y el nuevo registro es también como suplente
      if (
        existingResult.resultType.toLowerCase() === 'alternate' &&
        dto.resultType.toLowerCase() === 'alternate' &&
        existingResult.group === dto.group
      ) {
        throw new BadRequestException(
          'El participante ya tiene un resultado como suplente en este grupo',
        );
      }
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
    if (dto.resultType.toLowerCase() === resultTypeCatalog.INCUMBENT) {
      if (!dto.lot) {
        throw new BadRequestException('Debes ingresar un lote');
      }

      const lot = await this.lotService.getOne(
        dto.lot,
        dto.group,
        dto.drawType.toLowerCase(),
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
    if (
      dto.resultType.toLowerCase() === resultTypeCatalog.ALTERNATE &&
      !isUpdate
    ) {
      const registeredWinners = await this.getRegisteredWinners(
        dto.group,
        resultTypeCatalog.ALTERNATE,
        dto.drawType.toLowerCase(),
      );
      dto.orderNumber = registeredWinners.length + 1;
    }
  }

  // Asumimos que esta función existe y puede obtener el total de resultados registrados.
  async getTotalResultsRegistered(): Promise<number> {
    // Aquí deberías implementar la lógica para obtener el número total de resultados registrados.
    return this.resultRepository.count(); // Ejemplo usando TypeORM.
  }

  async getNextDraw(): Promise<any> {
    const totalResults = await this.getTotalResultsRegistered();
    return this.calculateNextDraw(totalResults);
  }

  private async calculateNextDraw(totalResults: number): Promise<any> {
    let incumbentCount = 0;

    for (const group in scheduledDraw) {
      for (const draw of scheduledDraw[group]) {
        const isCurrentDraw = totalResults < draw.quantity;

        if (draw.resultType.toLowerCase() === 'incumbent') {
          incumbentCount += draw.quantity;
        }

        if (isCurrentDraw) {
          if (draw.resultType.toLowerCase() === 'incumbent') {
            // Incumbents (titulares)
            const lot = await this.lotService.getOneById(
              incumbentCount - (draw.quantity - (totalResults + 1)),
            );
            return {
              group,
              lot,
              ...draw,
              drawNumber: totalResults + 1,
              orderNumber: null, // Los incumbents no tienen número de orden
            };
          } else if (draw.resultType.toLowerCase() === 'alternate') {
            // Alternates (suplentes)
            const orderNumber = totalResults + 1; // Asignar el número de orden del suplente
            return {
              group,
              lot: null, // Los alternates no tienen lote asignado
              ...draw,
              drawNumber: totalResults + 1,
              orderNumber, // Asignar el número de orden
            };
          }
        }

        totalResults -= draw.quantity;
      }
    }

    return null;
  }
}
