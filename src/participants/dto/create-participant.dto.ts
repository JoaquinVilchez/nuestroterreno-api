import {
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from '@nestjs/class-validator';
import { EnumToString } from 'helpers/enumToString';
import { DrawType } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantDto {
  @ApiProperty({ description: 'Número de bolilla', example: 101 })
  @IsNumber()
  ballNumber: number;

  @ApiProperty({
    description: 'Nombre del participante',
    example: 'Juan',
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Apellido',
    example: 'Pérez',
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'DNI del participante',
    example: '12345678',
    maxLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(8)
  dni: string;

  @ApiProperty({ description: 'Grupo de sorteo', example: 1 })
  @IsNumber()
  group: number;

  @ApiProperty({
    description: 'Tipo de sorteo',
    example: 'CPD',
    enum: EnumToString(DrawType),
  })
  @IsString()
  @IsEnum(DrawType, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(DrawType)}`,
  })
  type: string;
}
