import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/entities/order.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ZarinpalService } from './services/zarinpal.service';
import { PasargadService } from './services/pasargad.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [PaymentService, ZarinpalService, PasargadService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}