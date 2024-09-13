import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { EditParticipantDto } from './dto/edit-participant.dto';
import { ParticipantService } from './participant.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilterQueryResultDto } from 'src/results/dto/filter-query-result.dto';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @ApiTags('Participants')
  @ApiOperation({ summary: 'Obtener múltiples participantes' })
  @ApiQuery({ type: FilterQueryResultDto })
  @ApiResponse({
    status: 200,
    description: 'Participantes obtenidos exitosamente.',
  })
  @Get()
  async getMany(@Query() filterQuery) {
    const { group, drawType, forSelect } = filterQuery;
    return await this.participantService.getMany(group, drawType, forSelect);
  }

  @ApiTags('Participants')
  @ApiOperation({ summary: 'Obtener un participante por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del participante' })
  @ApiResponse({ status: 200, description: 'Participante encontrado.' })
  @ApiResponse({ status: 404, description: 'Participante no encontrado.' })
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.participantService.getOne(id);
  }

  @ApiTags('Participants')
  @ApiOperation({ summary: 'Crear un nuevo participante' })
  @ApiBody({
    type: CreateParticipantDto,
    description: 'Datos para crear un nuevo participante',
  })
  @ApiResponse({ status: 201, description: 'Participante creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @Post()
  async createOne(@Body() dto: CreateParticipantDto) {
    const data = await this.participantService.createOne(dto);
    return {
      message: 'Participante creado con éxito',
      data,
    };
  }

  @ApiTags('Participants')
  @ApiOperation({ summary: 'Editar un participante' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del participante' })
  @ApiBody({
    type: EditParticipantDto,
    description: 'Datos para editar un participante',
  })
  @ApiResponse({ status: 200, description: 'Participante editado con éxito.' })
  @ApiResponse({ status: 404, description: 'Participante no encontrado.' })
  @Put(':id')
  async editOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditParticipantDto,
  ) {
    const data = await this.participantService.editOne(id, dto);
    return {
      message: 'Participante editado con éxito',
      data,
    };
  }

  @ApiTags('Participants')
  @ApiOperation({ summary: 'Eliminar un participante' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del participante' })
  @ApiResponse({
    status: 200,
    description: 'Participante eliminado con éxito.',
  })
  @ApiResponse({ status: 404, description: 'Participante no encontrado.' })
  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.participantService.deleteOne(id);
    return {
      message: 'Participante eliminado con éxito',
      data,
    };
  }
}
