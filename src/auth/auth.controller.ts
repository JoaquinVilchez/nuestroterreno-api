// src/auth/auth.controller.ts
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: AuthDto) {
    const userValidate = await this.authService.validateUser(email, password);

    if (!userValidate) {
      throw new UnauthorizedException('Datos no válidos');
    }

    const jwt = await this.authService.generateJWT(userValidate);

    return jwt;
  }
}
