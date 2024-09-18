import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
} from '@nestjs/class-validator';
import { EnumToString } from 'helpers/enumToString';
import { UserRole } from 'src/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsString()
  @IsEnum(UserRole, {
    message: `Opción inválida. Las opciones correctas son ${EnumToString(UserRole)}`,
  })
  role: string;
}
