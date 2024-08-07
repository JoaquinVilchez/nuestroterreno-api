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

export class CreateResultDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  orderNumber: number;

  @Min(1)
  @Max(groups)
  @Type(() => Number)
  group: number;

  @IsString()
  @IsEnum(DrawType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(DrawType)}`,
  })
  drawType: string;

  @IsString()
  @IsEnum(ResultType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(ResultType)}`,
  })
  resultType: string;

  @IsNumber()
  @Type(() => Number)
  participant: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lot?: number;
}
