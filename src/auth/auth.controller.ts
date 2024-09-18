// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard) // Utiliza el guard para la autenticación local
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Usando Body para recibir solo los datos necesarios
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard) // Guard para verificar el token JWT
  @Get('profile') // GET en lugar de POST para obtener datos
  getProfile(@Request() req) {
    // Retorna directamente la propiedad user del request
    return req.user;
  }
}
