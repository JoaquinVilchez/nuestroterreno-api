import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { orderTypeValues } from 'helpers/catalogs';

export class FilterQueryResultDto {
  @IsOptional()
  @IsNumber()
  group?: number;

  @IsOptional()
  @IsString()
  resultType?: string;

  @IsOptional()
  @IsString()
  drawType?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  orderBy?: orderTypeValues;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[] | string;
}
