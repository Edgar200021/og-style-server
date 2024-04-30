import { HttpException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix('/api/v1');
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  app.enableCors({
    //origin: 'http://localhost:5173',
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Og Style')
    .setDescription('E-commerce')
    .setVersion('1.0')
    .addTag('shoes', 'clothes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    useGlobalPrefix: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const collection = new Map();

        errors.map(({ property, constraints, value }) => {
          const arrayFromConstraints = Object.values(constraints);
          collection.set(
            property,
            value === undefined
              ? `Заполните это поле`
              : arrayFromConstraints.at(-1),
          );
        });

        return new HttpException(
          {
            status: 'failed',
            errors: Object.fromEntries(collection),
          },
          400,
        );
      },
    }),
  );

  await app.listen(4000);
}
bootstrap();
