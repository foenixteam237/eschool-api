import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('eSchool Management API by RAMSEYS')
    .setDescription('Complete API for eSchool management system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT') || 3500;
  await app.listen(port);

  console.log(`
  🚀 eSchool API Server Started
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 Server URL: http://localhost:${port}
  📚 Swagger Docs: http://localhost:${port}/api/docs
  🔒 CORS Origin: ${corsOrigin}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();
