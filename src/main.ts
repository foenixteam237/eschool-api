import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  });

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('eSchool Management API by RAMSEYS')
    .setDescription('Complete API for eSchool management system with role-based auth, student/teacher/class tracking, grading, attendance, and finance.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  SwaggerModule.setup('api/docs', app, document);
  SwaggerModule.setup('docs', app, document);

  // Redirect root to Swagger docs for web preview
  const httpAdapter = app.getHttpAdapter().getInstance();
  if (httpAdapter && typeof httpAdapter.get === 'function') {
    httpAdapter.get('/', (_req: any, res: any) => {
      res.redirect('/api/v1/docs');
    });
  }

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

  const port = 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`
  🚀 eSchool API Server Started
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 Server URL: http://0.0.0.0:${port}
  📚 Swagger Docs: http://0.0.0.0:${port}/api/v1/docs
  🔒 CORS Origin: ${corsOrigin}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();
