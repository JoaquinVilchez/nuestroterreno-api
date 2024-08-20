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
import { CreateLotDto } from './dto/create-lot.dto';
import { EditLotDto } from './dto/edit-lot.dto';
import { LotService } from './lots.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('lot')
export class LotController {
  constructor(private readonly lotService: LotService) {}
  @ApiTags('Lots')
  @ApiOperation({ summary: 'Obtener muchos lotes' })
  @ApiQuery({ name: 'group', type: Number, description: 'Grupo de lotes' })
  @ApiQuery({ name: 'drawType', type: String, description: 'Tipo de sorteo' })
  @ApiQuery({
    name: 'quantity',
    type: Number,
    description: 'Cantidad de lotes a obtener',
  })
  @ApiQuery({
    name: 'orderBy',
    type: String,
    description: 'Ordenar resultados por',
  })
  @ApiResponse({ status: 200, description: 'Lotes obtenidos exitosamente.' })
  @Get()
  async getMany(@Query() filterQuery) {
    const { group, drawType, quantity, orderBy } = filterQuery;
    return await this.lotService.getMany(group, drawType, quantity, orderBy);
  }

  @ApiTags('Lots')
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del lote' })
  @ApiResponse({ status: 200, description: 'Lote encontrado.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.lotService.getOneById(id);
  }

  @ApiTags('Lots')
  @ApiOperation({ summary: 'Crear un lote' })
  @ApiBody({
    type: CreateLotDto,
    description: 'Datos para crear un nuevo lote',
  })
  @ApiResponse({ status: 201, description: 'Lote creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @Post()
  async createOne(@Body() dto: CreateLotDto) {
    const data = await this.lotService.createOne(dto);
    return {
      message: 'Lote creado con éxito',
      data,
    };
  }

  @ApiTags('Lots')
  @ApiOperation({ summary: 'Editar un lote' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del lote' })
  @ApiBody({ type: EditLotDto, description: 'Datos para editar un lote' })
  @ApiResponse({ status: 200, description: 'Lote editado con éxito.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  @Put(':id')
  async editOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditLotDto,
  ) {
    const data = await this.lotService.editOne(id, dto);
    return {
      message: 'Lote editado con éxito',
      data,
    };
  }

  @ApiTags('Lots')
  @ApiOperation({ summary: 'Eliminar un lote' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del lote' })
  @ApiResponse({ status: 200, description: 'Lote eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.lotService.deleteOne(id);
    return {
      message: 'Lote eliminado con éxito',
      data,
    };
  }
}
