import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { EditResultDto } from './dto/edit-result.dto';
import { FilterQueryResultDto } from './dto/filter-query-result.dto';
import { ParticipantService } from 'src/participants/participant.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('result')
export class ResultController {
  constructor(
    private readonly resultService: ResultService,
    private readonly participantService: ParticipantService,
  ) {}

  @Get('next-draw')
  async getNextDraw() {
    try {
      const nextDraw = await this.resultService.getNextDraw();
      return { status: 'success', data: nextDraw };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching next draw information',
      );
    }
  }

  @Get('current')
  async getCurrentDraw() {
    const lastResult = await this.resultService.getLastResult();
    if (!lastResult) {
      throw new NotFoundException('No hay sorteos registrados aún.');
    }
    return {
      message: 'Sorteo actual obtenido exitosamente',
      data: lastResult,
    };
  }

  @ApiTags('Results')
  @ApiOperation({ summary: 'Obtener múltiples resultados' })
  @ApiQuery({ type: FilterQueryResultDto })
  @ApiResponse({
    status: 200,
    description: 'Resultados obtenidos exitosamente.',
  })
  @Public()
  @Get()
  async getMany(@Query() filterQuery: FilterQueryResultDto) {
    const { group, resultType, drawType, quantity, orderBy, includes } =
      filterQuery;

    const includesArray = includes
      ? Array.isArray(includes)
        ? includes
        : includes.split(',')
      : [];

    return await this.resultService.getMany(
      group,
      resultType,
      drawType,
      quantity,
      orderBy,
      includesArray || [],
    );
  }

  @ApiTags('Results')
  @ApiOperation({ summary: 'Obtener un resultado por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del resultado' })
  @ApiResponse({ status: 200, description: 'Resultado encontrado.' })
  @ApiResponse({ status: 404, description: 'Resultado no encontrado.' })
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.resultService.getOne(id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new NotFoundException(`Resultado con id ${id} no encontrado`);
    }
  }

  @ApiTags('Results')
  @ApiOperation({ summary: 'Registrar un nuevo resultado' })
  @ApiBody({
    type: CreateResultDto,
    description: 'Datos para crear un nuevo resultado',
  })
  @ApiResponse({ status: 201, description: 'Resultado registrado con éxito.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error en el proceso.',
  })
  @Post()
  async createOne(@Body() dto: CreateResultDto) {
    try {
      await this.resultService.validateResult(dto);
      const data = await this.resultService.createOne(dto);
      return {
        message: 'Resultado registrado con éxito',
        data,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al registrar el resultado');
    }
  }

  @ApiTags('Results')
  @ApiOperation({ summary: 'Editar un resultado' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del resultado a editar',
  })
  @ApiBody({
    type: EditResultDto,
    description: 'Datos para editar un resultado',
  })
  @ApiResponse({ status: 200, description: 'Resultado editado con éxito.' })
  @ApiResponse({
    status: 404,
    description: 'Resultado no encontrado o error al editar.',
  })
  @Put(':id')
  async editOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditResultDto,
  ) {
    try {
      const data = await this.resultService.editOne(id, dto);
      return {
        message: 'Resultado editado con éxito',
        data,
      };
    } catch (error) {
      throw new NotFoundException(
        `Hubo un error al editar el resultado con el id ${id}`,
      );
    }
  }

  @ApiTags('Results')
  @ApiOperation({ summary: 'Eliminar un resultado' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del resultado a eliminar',
  })
  @ApiResponse({ status: 200, description: 'Resultado eliminado con éxito.' })
  @ApiResponse({
    status: 404,
    description: 'Resultado no encontrado o error al eliminar.',
  })
  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.resultService.deleteOne(id);
      return {
        message: 'Resultado eliminado con éxito',
        data,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new NotFoundException(
        `Hubo un error al eliminar el resultado con el id ${id}`,
      );
    }
  }

  @ApiTags('Results')
  @ApiOperation({ summary: 'Obtener resultados por ID de participante' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del participante' })
  @ApiResponse({
    status: 200,
    description: 'Resultados del participante obtenidos exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Participante no encontrado o sin resultados.',
  })
  @Get('participant/:id')
  async getByParticipantController(@Param('id', ParseIntPipe) id: number) {
    const participant = await this.participantService.getOne(id);
    await this.resultService.getByParticipant(participant);
  }
}
