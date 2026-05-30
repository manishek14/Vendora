import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ShippingRule } from '../../database/entities/shipping-rule.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingRule)
    private shippingRuleRepo: Repository<ShippingRule>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async calculateCost(toCity: string, totalWeightGr: number): Promise<{ cost: number | null; method: string; estimatedDays: number }> {
    let cost: number | null = null;
    let method = 'تیپاکس';
    let estimatedDays = 2;
    try {
      cost = await this.getCostFromExternalApi(toCity, totalWeightGr);
    } catch (error) {
      const rule = await this.shippingRuleRepo.findOne({
        where: {
          fromCity: 'تهران',
          toCity,
          weightMinGr: LessThanOrEqual(totalWeightGr),
          weightMaxGr: MoreThanOrEqual(totalWeightGr),
          isActive: true,
        },
      });
      if (rule) {
        cost = rule.cost;
        method = rule.methodName;
        estimatedDays = rule.estimatedDays;
      } else {
        throw new NotFoundException('هزینه ارسال برای این شهر و وزن یافت نشد');
      }
    }


    return { cost, method, estimatedDays };
  }

  private async getCostFromExternalApi(toCity: string, weightGr: number): Promise<any> {
    const apiUrl = this.configService.get<string>('TIPAX_API_URL');
    const apiKey = this.configService.get<string>('TIPAX_API_KEY');
    
    if (!apiUrl || !apiKey) {
      throw new Error('External API not configured');
    }

    return {apiKey, apiUrl}
  }
}