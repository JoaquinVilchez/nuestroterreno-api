import { EnumToString } from 'helpers/enumToString';
import { DrawType } from '../enums';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';

export class CreateLotDto {
  @IsNumber()
  group: number;

  @IsString()
  @IsEnum(DrawType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(
      DrawType,
    )}`,
  })
  drawType: string;

  @IsString()
  denomination: string;

  @IsOptional()
  @IsString()
  image: string;
}
