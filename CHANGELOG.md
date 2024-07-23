# Changelog

## [Unreleased]

### Added

- **Advanced TypeORM configurations**: Se ha añadido configuración avanzada para TypeORM, incluyendo opciones para manejar automáticamente las entidades, configuraciones para migraciones, y parámetros para sincronización en el archivo `database.config.ts`.

### Initial Commit

- **Basic NestJS and TypeORM configurations**: Inicialización del proyecto con la configuración básica de NestJS y TypeORM. Se estableció la configuración inicial en el archivo `app.module.ts` y la estructura del proyecto.

### [1.0.0] - 2024-07-23

### Changed

- **Configuración de CORS**: Se actualizó la configuración de CORS en `app.module.ts` para permitir el acceso desde dominios específicos y manejar solicitudes preflight.
- **Generación de ormconfig.json**: Se mejoró la funcionalidad para generar el archivo `ormconfig.json` usando el script en `scripts/generate-typeorm-config-file.ts`, incluyendo la corrección de errores relacionados con la importación y la generación del archivo.

### Fixed
