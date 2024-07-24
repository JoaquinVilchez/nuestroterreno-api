import {
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from '@nestjs/class-validator';
import { EnumToString } from 'helpers/enumToString';
import { DrawType } from '../enums';

export class CreateParticipantDto {
  @IsNumber()
  ballNumber: number;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  secondaryLastName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(8)
  dni: string;

  @IsNumber()
  group: number;

  @IsString()
  @IsEnum(DrawType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(DrawType)}`,
  })
  type: string;
}
