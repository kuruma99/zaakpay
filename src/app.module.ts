import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getTypeOrmConfigs } from './config/typeOrm.config';

@Module({
  imports: [
    // nest js modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeORM module
    TypeOrmModule.forRoot(getTypeOrmConfigs()),

    PaymentModule,
  ],
})
export class AppModule {}
