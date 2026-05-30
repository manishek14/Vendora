import { Controller, Post, Body, Get, Query, Redirect } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RequestPaymentDto } from './dto/request-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('request')
  async requestPayment(@Body() dto: RequestPaymentDto) {
    return this.paymentService.requestPayment(dto.orderId, dto.gateway);
  }

  @Get('callback')
@Redirect()
async callback(@Query() query: VerifyPaymentDto) {
  const { authority, status, orderId, gateway } = query;
  if (!gateway || !authority || !orderId) {
    return { url: `${process.env.FRONTEND_URL}/payment/failed?message=اطلاعات ناقص` };
  }
  const result = await this.paymentService.verifyPayment(
    gateway,
    authority,
    +orderId,
    status,
  );
  if (result.success) {
    return { url: `${process.env.FRONTEND_URL}/payment/success?refId=${result.refId}` };
  } else {
    return { url: `${process.env.FRONTEND_URL}/payment/failed?message=${result.message}` };
  }
}
}