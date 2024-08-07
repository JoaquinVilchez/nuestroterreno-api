import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LotModule } from './lots/lots.module';
import { Module } from '@nestjs/common';
import { ParticipantModule } from './participants/participant.module';
import { ResultModule } from './results/result.module';
import { TYPEORM_CONFIG } from 'config/constants';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import databaseConfig from '../config/database.config';

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
    ResultModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
