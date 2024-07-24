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

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Get()
  async getMany(@Query() filterQuery) {
    const { group, type } = filterQuery;
    return await this.participantService.getMany(group, type);
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.participantService.getOne(id);
  }

  @Post()
  async createOne(@Body() dto: CreateParticipantDto) {
    const data = await this.participantService.createOne(dto);
    return {
      message: 'Participante creado con éxito',
      data,
    };
  }

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

  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.participantService.deleteOne(id);
    return {
      message: 'Participante eliminado con éxito',
      data,
    };
  }
}
