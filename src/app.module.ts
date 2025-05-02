import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import configuration from './config/configuration';
import validationSchema from './config/env.validation';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    OrdersModule,
    NatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
