export interface PaymentGateway {
  requestPayment(amount: number, callbackUrl: string, orderId: number): Promise<{ authority: string; redirectUrl: string }>;
  verifyPayment(authority: string, amount: number): Promise<{ success: boolean; refId: string }>;
}