import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ParticipantModule } from './participants/participant.module';
import databaseConfig from '../config/database.config';
import * as Joi from 'joi';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_CONFIG } from 'config/constants';
import { LotModule } from './lots/lots.module';

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
      }),
    }),
    ParticipantModule,
    LotModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
