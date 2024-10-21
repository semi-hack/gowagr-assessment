import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { createDocument } from './shared/swagger/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Simple Bank API Docs',
  };

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  SwaggerModule.setup('api/v1', app, createDocument(app), customOptions);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
