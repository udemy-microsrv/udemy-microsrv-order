import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import configuration from './config/configuration';
import validationSchema from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
