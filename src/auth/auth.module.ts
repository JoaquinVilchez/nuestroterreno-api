// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserModule],
  providers: [AuthService, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
