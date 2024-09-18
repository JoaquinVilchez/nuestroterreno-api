import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from 'config/constants';
import { Request } from 'express';
import { useToken } from 'helpers/use.token';
import { UserService } from 'src/user/user.service';
import { IUseToken } from '../interfaces/auth.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers['nuestroterreno_token'];

    if (!token || Array.isArray(token)) {
      throw new UnauthorizedException('Token inválido');
    }

    const manageToken: IUseToken | string = useToken(token);

    if (typeof manageToken === 'string') {
      throw new UnauthorizedException(manageToken);
    }

    if (manageToken.isExpired) {
      throw new UnauthorizedException('Token expirado');
    }

    const { sub } = manageToken;
    const user = await this.userService.getOne(+sub);

    if (!user) {
      throw new UnauthorizedException('Usuario inválido');
    }

    req.idUser = user.id;
    req.roleUser = user.role;

    return true;
  }
}
