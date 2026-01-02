import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';

let cachedApp: express.Express;

async function bootstrap(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

  // Security
  app.use(helmet());
  app.enableCors();

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  await app.init();

  cachedApp = expressApp;
  return cachedApp;
}

/**
 * Google Cloud Functions HTTP handler
 * Deploy with: gcloud functions deploy nestjs-api --runtime nodejs22 --trigger-http --entry-point handler
 */
export const handler = async (req: Request, res: Response): Promise<void> => {
  const app = await bootstrap();
  app(req, res);
};

// For local testing
export { bootstrap };
