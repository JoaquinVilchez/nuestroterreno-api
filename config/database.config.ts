import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

function typeormModuleOptions(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'joaquinvilchez',
    password: '12345678',
    database: 'nuestroterreno_api_db',
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    autoLoadEntities: true,
    migrations: [join(__dirname, '../src/migrations/*{.ts,.js}')],
    dropSchema: false,
    synchronize: false,
    logging: true,
    logger: 'file',
  };
}

export default registerAs('database', () => ({
  config: typeormModuleOptions(),
}));

export const databaseConfig = new DataSource(
  typeormModuleOptions() as DataSourceOptions,
);
