import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.TCP,
        options: {
          port: configService.get('app.port'),
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();
  const logger = new Logger('bootstrap');
  logger.log(
    `Microservice is listening on port ${app.get(ConfigService).get('app.port')}`,
  );
}

bootstrap();
