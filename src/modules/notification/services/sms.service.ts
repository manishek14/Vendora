import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async send(to: string, templateId: string, params?: Record<string, string>): Promise<boolean> {
    try {
      const apiKey = this.configService.get<string>('sms.apiKey');
      const url = 'https://api.sms.ir/v1/send/verify';

      const response = await lastValueFrom(
        this.httpService.post(
          url,
          {
            mobile: to,
            templateId,
            parameters: params ? Object.entries(params).map(([key, value]) => ({ name: key, value })) : [],
          },
          {
            headers: {
              'X-API-KEY': apiKey!,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.status === 1) {
        this.logger.log(`SMS sent to ${to}`);
        return true;
      }
      this.logger.error(`SMS failed: ${response.data.message}`);
      return false;
    } catch (error: any) {
      this.logger.error(`SMS error to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendOtp(to: string, code: string): Promise<boolean> {
    const templateId = this.configService.get<string>('sms.templates.otp');
    if (!templateId) {
      this.logger.error('SMS OTP template ID not configured');
      return false;
    }
    return this.send(to, templateId, { code });
  }
}