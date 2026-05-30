import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../../../common/interfaces/payment-gateway.interface';

@Injectable()
export class PasargadService implements PaymentGateway {
  async requestPayment(amount: number, callbackUrl: string, orderId: number) {
    const authority = `PS_${Date.now()}_${orderId}`;
    const redirectUrl = `https://pep.shaparak.ir/Payment.aspx?n=${authority}`;
    return { authority, redirectUrl };
  }

  async verifyPayment(authority: string, amount: number) {
    const success = authority.startsWith('PS_');
    return { success, refId: success ? `REF_${Date.now()}` : '' };
  }
}