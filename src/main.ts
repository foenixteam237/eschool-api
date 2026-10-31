import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Disable X-Powered-By header to prevent fingerprinting
  const httpAdapter = app.getHttpAdapter().getInstance();
  if (httpAdapter && typeof httpAdapter.disable === 'function') {
    httpAdapter.disable('x-powered-by');
  }

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';

  // Enable CORS with origin reflection for credentialed cross-origin requests
  app.enableCors({
    origin: (_origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
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
  if (httpAdapter && typeof httpAdapter.get === 'function') {
    httpAdapter.get('/', (_req: any, res: any) => {
      res.redirect('/api/v1/docs');
    });
  }

  // Global pipes with strict whitelist and sanitization
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
  🔒 CORS Policy: Enabled for all origins (reflecting with credentials)
  🔒 Configured Origin: ${corsOrigin}
  🛡️ Security: RolesGuard active (RBAC), X-Powered-By disabled, Payload Sanitization enabled
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();
