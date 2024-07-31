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

@Controller('lot')
export class LotController {
  constructor(private readonly lotService: LotService) {}

  @Get()
  async getMany(@Query() filterQuery) {
    const { group, drawType, quantity, orderBy } = filterQuery;
    return await this.lotService.getMany(group, drawType, quantity, orderBy);
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.lotService.getOneById(id);
  }

  @Post()
  async createOne(@Body() dto: CreateLotDto) {
    const data = await this.lotService.createOne(dto);
    return {
      message: 'Lote creado con éxito',
      data,
    };
  }

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

  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.lotService.deleteOne(id);
    return {
      message: 'Lote eliminado con éxito',
      data,
    };
  }
}
