import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

// Función que define y devuelve las opciones de configuración para TypeORM
function typeormModuleOptions(): TypeOrmModuleOptions {
  return {
    type: 'mysql', // Tipo de base de datos
    host: process.env.DATABASE_HOST, // Host de la base de datos desde variables de entorno
    port: parseInt(process.env.DATABASE_PORT, 10), // Puerto de la base de datos, convertido a entero
    username: process.env.DATABASE_USERNAME, // Usuario de la base de datos desde variables de entorno
    password: process.env.DATABASE_PASSWORD, // Contraseña de la base de datos desde variables de entorno
    database: process.env.DATABASE_NAME, // Nombre de la base de datos desde variables de entorno

    // Ubicación de las entidades, usadas por TypeORM para mapear las tablas de la base de datos
    entities: [join(__dirname, '../**/**/*entity{.ts,.js}')],

    // Opciones adicionales para TypeORM
    autoLoadEntities: true, // Carga automáticamente las entidades en el módulo de TypeORM
    migrationsRun: true, // Ejecuta las migraciones automáticamente
    migrations: [join(__dirname, '../migration/**/*{.ts,.js}')], // Ubicación de las migraciones
    migrationsTableName: 'migrations_typeorm', // Nombre de la tabla que guarda el historial de migraciones

    // Opciones de sincronización y logging
    synchronize: false, // No sincroniza automáticamente la base de datos con las entidades (se recomienda deshabilitar en producción)
    logging: true, // Activa el logging de consultas y otras operaciones
    logger: 'file', // Usa el sistema de archivos para guardar los logs
  };
}

// Exporta la configuración usando `registerAs` de @nestjs/config
export default registerAs('database', () => ({
  config: typeormModuleOptions(), // Llama a la función que devuelve las opciones de configuración
}));
