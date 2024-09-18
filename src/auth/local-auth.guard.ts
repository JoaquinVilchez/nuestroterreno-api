// src/auth/local-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // No es necesario agregar más código aquí, a menos que necesites personalizar el comportamiento del guard
}
