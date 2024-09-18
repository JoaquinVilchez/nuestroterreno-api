import { ConfigModule, ConfigService } from '@nestjs/config';
import { LotModule } from './lots/lots.module';
import { Module } from '@nestjs/common';
import { ParticipantModule } from './participants/participant.module';
import { ResultModule } from './results/result.module';
import { TYPEORM_CONFIG } from 'config/constants';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import databaseConfig from '../config/database.config';
import { AppGateway } from './app.gateway';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<TypeOrmModuleOptions>(TYPEORM_CONFIG),
    }),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        CORS_ORIGIN: Joi.string().uri().required(),
        CORS_METHODS: Joi.string().required(),
        CORS_ALLOWED_HEADERS: Joi.string().required(),
        CORS_CREDENTIALS: Joi.boolean().required(),
        CORS_PREFLIGHT_CONTINUE: Joi.boolean().required(),
        CORS_OPTIONS_SUCCESS_STATUS: Joi.number().required(),
      }),
    }),
    ParticipantModule,
    LotModule,
    ResultModule,
    UserModule,
    AuthModule,
  ],

  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
