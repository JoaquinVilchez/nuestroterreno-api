import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SERVER_PORT } from '../config/constants';
import generateTypeOrmConfigFile from 'scripts/generate-typeorm-config-file';
import { corsConfig } from '../config/cors.config';
import { setupSwagger } from 'config/swagger.config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);
  const port = parseInt(config.get<string>(SERVER_PORT), 10) || 3000;

  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(reflector));

  generateTypeOrmConfigFile(config);

  app.enableCors(corsConfig(config));
  setupSwagger(app);

  await app.listen(port);
  logger.log(`Server is runnign at ${await app.getUrl()}`);
}
bootstrap();
