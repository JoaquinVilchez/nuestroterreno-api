import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get()
  async getMany(@Query() filterQuery: FilterQueryResultDto) {
    const { group, resultType, drawType, quantity, orderBy } = filterQuery;
    return await this.resultService.getMany(
      group,
      resultType,
      drawType,
      quantity,
      orderBy,
    );
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.resultService.getOne(id);
    } catch (error) {
      throw new NotFoundException(`Resultado con id ${id} no encontrado`);
    }
  }

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
      throw new BadRequestException('Error al registrar el resultado');
    }
  }

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

  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.resultService.deleteOne(id);
      return {
        message: 'Resultado eliminado con éxito',
        data,
      };
    } catch (error) {
      throw new NotFoundException(
        `Hubo un error al eliminar el resultado con el id ${id}`,
      );
    }
  }
}