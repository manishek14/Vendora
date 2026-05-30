import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { ZarinpalService } from './services/zarinpal.service';
import { PasargadService } from './services/pasargad.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private zarinpalService: ZarinpalService,
    private pasargadService: PasargadService,
  ) {}

  async requestPayment(orderId: number, gateway: 'zarinpal' | 'pasargad') {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, status: OrderStatus.PENDING_PAYMENT },
    });
    if (!order) {
      throw new NotFoundException('سفارش یافت نشد یا وضعیت آن مناسب نیست');
    }

    const callbackUrl = `${process.env.BASE_URL}/payment/callback?orderId=${orderId}&gateway=${gateway}`;
    let service;
    if (gateway === 'zarinpal') service = this.zarinpalService;
    else service = this.pasargadService;

    const { authority, redirectUrl } = await service.requestPayment(order.remainingAmount, callbackUrl, orderId);
    order.paymentGateway = gateway;
    order.paymentAuthority = authority;
    await this.orderRepo.save(order);

    return { redirectUrl, authority };
  }

  async verifyPayment(gateway: 'zarinpal' | 'pasargad', authority: string, orderId: number, status?: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, paymentAuthority: authority },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    if (status === 'NOK') {
      return { success: false, message: 'پرداخت توسط کاربر لغو شد' };
    }

    let service;
    if (gateway === 'zarinpal') service = this.zarinpalService;
    else service = this.pasargadService;

    const { success, refId } = await service.verifyPayment(authority, order.remainingAmount);
    if (success) {
      order.paymentRefId = refId;
      order.status = OrderStatus.WAITING_APPROVAL;
      order.remainingAmount = 0;
      await this.orderRepo.save(order);
      return { success: true, refId };
    } else {
      return { success: false, message: 'پرداخت ناموفق بود' };
    }
  }
}