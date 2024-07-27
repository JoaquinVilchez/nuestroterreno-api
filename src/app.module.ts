import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TYPEORM_CONFIG } from './config/constants';
import { ParticipantModule } from './participants/participant.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // Configuración asíncrona de TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService], // Inyecta ConfigService para acceder a la configuración
      useFactory: (config: ConfigService) =>
        config.get<TypeOrmModuleOptions>(TYPEORM_CONFIG), // Usa la función de fábrica para obtener la configuración de TypeORM desde ConfigService
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Hace que la configuración esté disponible globalmente en toda la aplicación.
      load: [databaseConfig], // Carga la configuración desde los archivos y/o funciones proporcionadas.
    }),
    ParticipantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
