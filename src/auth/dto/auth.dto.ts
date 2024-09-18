// src/auth/dto/login.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from '@nestjs/class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
