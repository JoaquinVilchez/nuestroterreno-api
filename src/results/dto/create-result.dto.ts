import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { EnumToString } from 'helpers/enumToString';
import { DrawType } from 'src/enums/draw-type.enum';
import { ResultType } from '../enums';
import { groups } from 'helpers/catalogs';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResultDto {
  @ApiProperty({
    description: 'Número de orden (opcional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  orderNumber: number;

  @ApiProperty({
    description: 'Grupo del sorteo',
    example: 1,
    minimum: 1,
    maximum: 100,
  })
  @Min(1)
  @Max(groups)
  @Type(() => Number)
  group: number;

  @ApiProperty({
    description: 'Tipo de sorteo',
    example: 'GENERAL',
    enum: EnumToString(DrawType),
  })
  @IsString()
  @IsEnum(DrawType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(DrawType)}`,
  })
  drawType: string;

  @ApiProperty({
    description: 'Tipo de resultado',
    example: 'alternate',
    enum: EnumToString(ResultType),
  })
  @IsString()
  @IsEnum(ResultType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(ResultType)}`,
  })
  resultType: string;

  @ApiProperty({ description: 'ID del participante', example: 123 })
  @IsNumber()
  @Type(() => Number)
  participant: number;

  @ApiProperty({
    description: 'ID del lote (opcional)',
    example: 456,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lot?: number;
}
