import { EnumToString } from 'helpers/enumToString';
import { DrawType } from '../enums';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLotDto {
  @ApiProperty({ description: 'Grupo del lote', example: 1 })
  @IsNumber()
  group: number;

  @ApiProperty({
    description: 'Tipo de sorteo',
    example: 'CPD',
    enum: EnumToString(DrawType),
  })
  @IsString()
  @IsEnum(DrawType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(
      DrawType,
    )}`,
  })
  drawType: string;

  @ApiProperty({ description: 'Denominación del lote', example: 'Lote A' })
  @IsString()
  denomination: string;

  @ApiProperty({
    description: 'Imagen del lote (opcional)',
    example: 'image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image: string;
}
