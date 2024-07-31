import 'dotenv/config';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

console.log(process.env.DATABASE_HOST);

function typeormModuleOptions(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
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
