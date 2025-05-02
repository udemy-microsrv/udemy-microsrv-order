import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.NATS,
        options: {
          servers: configService.get('transport.nats.servers'),
        },
      }),
      inject: [ConfigService],
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen();

  const logger = new Logger('bootstrap');
  logger.log('Microservice (microsrv-order) is up and running');
}

bootstrap();
