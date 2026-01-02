import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  // Security - adjusted for GraphQL Playground
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global prefix for REST endpoints
  const prefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(prefix, {
    exclude: ['graphql'], // Exclude GraphQL from prefix
  });

  // API Versioning for REST endpoints (URI path: /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: process.env.API_VERSION || '1',
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger for REST API
  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle(process.env.SWAGGER_TITLE || 'NestJS Hybrid API')
      .setDescription(process.env.SWAGGER_DESCRIPTION || 'REST API Documentation')
      .setVersion(process.env.SWAGGER_VERSION || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${prefix}/docs`, app, document);
    logger.log(`Swagger docs available at /${prefix}/docs`);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  const version = process.env.API_VERSION || '1';
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`REST API available at http://localhost:${port}/${prefix}/v${version}/`);
  logger.log(`GraphQL Playground available at http://localhost:${port}/graphql`);
}

bootstrap();
