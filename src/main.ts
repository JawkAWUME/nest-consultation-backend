// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    bufferLogs: true,
  });
  
  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  
  app.useLogger(logger);
  
  // Global prefix pour l'API
  app.setGlobalPrefix('');
  
  // CORS pour production
  app.enableCors({
    origin: [
      'https://santeado.com',
      'http://localhost:4200',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  
  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Sécurité - Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  
  const port = configService.get('app.port') || 8080;
  
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application démarrée sur le port ${port}`);
  logger.log(`📁 Environnement: ${configService.get('app.nodeEnv')}`);
}
bootstrap();