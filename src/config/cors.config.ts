import { ConfigService } from '@nestjs/config';

export const corsConfig = (config: ConfigService) => ({
  origin: config.get<string>('CORS_ORIGIN'),
  methods: config.get<string>('CORS_METHODS'),
  allowedHeaders: config.get<string>('CORS_ALLOWED_HEADERS'),
  credentials: config.get<boolean>('CORS_CREDENTIALS'),
  preflightContinue: config.get<boolean>('CORS_PREFLIGHT_CONTINUE'),
  optionsSuccessStatus: config.get<number>('CORS_OPTIONS_SUCCESS_STATUS'),
});
