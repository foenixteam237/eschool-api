import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14';

export const swaggerCustomOptions: SwaggerCustomOptions = {
  customSiteTitle: 'eSchool Management API - Documentation',
  customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  customCssUrl: [
    `${SWAGGER_CDN}/swagger-ui.min.css`,
    `${SWAGGER_CDN}/swagger-ui-standalone-preset.min.css`,
  ],
  customJs: [
    `${SWAGGER_CDN}/swagger-ui-bundle.min.js`,
    `${SWAGGER_CDN}/swagger-ui-standalone-preset.min.js`,
  ],
  customCss: `
    .swagger-ui .opblock .opblock-summary-path-description-wrapper { 
      align-items: center; 
      display: flex; 
      flex-wrap: wrap; 
      gap: 0 10px; 
      padding: 0 10px; 
      width: 100%; 
    }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 25px 0; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
  },
};

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('eSchool Management API by RAMSEYS')
    .setDescription(
      'Complete API for eSchool management system with role-based auth, student/teacher/class tracking, grading, attendance, and finance.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document, swaggerCustomOptions);
  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);
  SwaggerModule.setup('docs', app, document, swaggerCustomOptions);

  return document;
}
