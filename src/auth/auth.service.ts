import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PayloadToken } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getOneByEmail(email);

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      return user;
    } else {
      return null;
    }
  }

  async signJWT({
    payload,
    secret,
    expires,
  }: {
    payload: jwt.JwtPayload;
    secret: string;
    expires: number | string;
  }) {
    const sign = jwt.sign(payload, secret, { expiresIn: expires });

    return sign;
  }

  public async generateJWT(user: User): Promise<any> {
    const result = await this.userService.getOne(user.id);

    const payload: PayloadToken = {
      role: result.role,
      sub: result.id.toString(),
    };

    return {
      accesToken: await this.signJWT({
        payload,
        secret: process.env.JWT_SECRET,
        expires: '1h',
      }),
      user,
    };
  }
}
