import { ConfigService } from '@nestjs/config';

export const jwtConfig = (config: ConfigService) => {
  return {
    origin: config.get<string>('JWT_SECRET'),
  };
};
