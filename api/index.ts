import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger, SWAGGER_CDN } from '../src/swagger.config';

const server: Express = express();
let isAppInitialized = false;

// Intercept static Swagger UI asset requests and redirect to CDN (avoids 404/blank page on Vercel)
server.get(/.*swagger-ui(-standalone-preset)?\.(js|css)(\.map)?$/, (req: Request, res: Response) => {
  const filename = req.path.split('/').pop() || '';
  if (filename.endsWith('.css')) {
    return res.redirect(302, `${SWAGGER_CDN}/swagger-ui.min.css`);
  }
  if (filename.includes('standalone')) {
    return res.redirect(302, `${SWAGGER_CDN}/swagger-ui-standalone-preset.min.js`);
  }
  return res.redirect(302, `${SWAGGER_CDN}/swagger-ui-bundle.min.js`);
});

server.get(/.*favicon-(16x16|32x32)\.png$/, (_req: Request, res: Response) => {
  return res.redirect(302, 'https://nestjs.com/img/logo-small.svg');
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const httpAdapter = app.getHttpAdapter().getInstance();
  if (httpAdapter && typeof httpAdapter.disable === 'function') {
    httpAdapter.disable('x-powered-by');
  }

  app.enableCors({
    origin: (_origin, callback) => callback(null, true),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  });

  // Setup Swagger with CDN assets for Vercel
  setupSwagger(app);

  if (httpAdapter && typeof httpAdapter.get === 'function') {
    httpAdapter.get('/', (_req: Request, res: Response) => {
      res.redirect('/api/v1/docs');
    });
    httpAdapter.get('/api', (_req: Request, res: Response) => {
      res.redirect('/api/v1/docs');
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  await app.init();
  isAppInitialized = true;
}

export default async function handler(req: Request, res: Response) {
  if (!isAppInitialized) {
    await bootstrap();
  }
  // If Vercel internal rewrite routed the request to /api, restore original path
  const originalPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-url'] as string);
  if (originalPath && req.url === '/api') {
    req.url = originalPath;
  }
  return server(req, res);
}

