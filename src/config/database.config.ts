import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

// Función que define y devuelve las opciones de configuración para TypeORM
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
    migrationsRun: false,
    migrations: [join(__dirname, '../src/migrations/*{.ts,.js}')],
    migrationsTableName: 'migrations_typeorm',
    synchronize: false,
    logging: true,
    logger: 'file',
  };
}

// Exporta la configuración usando `registerAs` de @nestjs/config
export default registerAs('database', () => ({
  config: typeormModuleOptions(),
}));

// Crea y exporta una instancia de DataSource
export const AppDataSource = new DataSource(
  typeormModuleOptions() as DataSourceOptions,
);
