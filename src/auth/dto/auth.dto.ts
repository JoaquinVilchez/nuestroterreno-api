import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { AuthBody } from '../interfaces/auth.interface';

export class AuthDto implements AuthBody {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
