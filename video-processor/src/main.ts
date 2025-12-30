import 'reflect-metadata';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  AllExceptionsFilter,
  ApiExceptionFilter,
  HttpExceptionFilter,
} from './common/exception/exception';
import { ApiConfig } from './common/config/config';
import { json, urlencoded } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter),
    new ApiExceptionFilter(),
    new HttpExceptionFilter(),
  );
  app.use(json({ limit: ApiConfig.MAX_FILE_SIZE }));
  app.use(urlencoded({ limit: ApiConfig.MAX_FILE_SIZE, extended: true }));

  app.enableCors({
    origin: ApiConfig.ALLOWED_CORS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: ApiConfig.KAFKA_CLIENT_ID,
        brokers: ApiConfig.KAFKA_BROKERS,
      },
      consumer: {
        groupId: ApiConfig.KAFKA_GROUP_ID,
        sessionTimeout: 120000,
        heartbeatInterval: 10000,
        rebalanceTimeout: 10000,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.VIDEO_PROCESSOR_PORT || 8000);
}
bootstrap().catch((err) => {
  console.error(err);
});
