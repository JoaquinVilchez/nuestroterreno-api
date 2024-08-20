import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { orderTypeValues } from 'helpers/catalogs';

export class FilterQueryResultDto {
  @ApiPropertyOptional({ description: 'Grupo del sorteo', example: 1 })
  @IsOptional()
  @IsNumber()
  group?: number;

  @ApiPropertyOptional({
    description: 'Tipo de resultado',
    example: 'incumbent',
  })
  @IsOptional()
  @IsString()
  resultType?: string;

  @ApiPropertyOptional({ description: 'Tipo de sorteo', example: 'GENERAL' })
  @IsOptional()
  @IsString()
  drawType?: string;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados a obtener',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Ordenar por', example: 'date' })
  @IsOptional()
  @IsString()
  orderBy?: orderTypeValues;

  @ApiPropertyOptional({
    description: 'Incluir datos adicionales',
    example: ['participant', 'lot'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[] | string;
}
