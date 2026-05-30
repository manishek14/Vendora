import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../../../common/interfaces/payment-gateway.interface';

@Injectable()
export class ZarinpalService implements PaymentGateway {
  async requestPayment(amount: number, callbackUrl: string, orderId: number) {
    const authority = `ZP_${Date.now()}_${orderId}`;
    const redirectUrl = `https://payment.zarinpal.com/pg/StartPay/${authority}`;
    return { authority, redirectUrl };
  }

  async verifyPayment(authority: string, amount: number) {
    const success = authority.startsWith('ZP_');
    return { success, refId: success ? `REF_${Date.now()}` : '' };
  }
}