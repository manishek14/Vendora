import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountCode } from '../../database/entities/discount-code.entity';
import { CreateDiscountDto } from './dto/create-discount.dto';


@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountCode)
    private discountRepo: Repository<DiscountCode>,
  ) {}

  async validateDiscount(code: string, cartTotal: number, userId?: number): Promise<DiscountCode> {
    const discount = await this.discountRepo.findOne({ where: { code, isActive: true } });
    if (!discount) throw new NotFoundException('کد تخفیف معتبر نیست');

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      throw new BadRequestException('کد تخفیف منقضی شده است');
    }
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      throw new BadRequestException('کد تخفیف به حداکثر تعداد استفاده رسیده است');
    }
    if (discount.minCartAmount && cartTotal < discount.minCartAmount) {
      throw new BadRequestException(`حداقل مبلغ سبد خرید برای این کد تخفیف ${discount.minCartAmount} تومان است`);
    }
    return discount;
  }

  async calculateDiscount(discount: DiscountCode, cartTotal: number): Promise<number> {
    let discountAmount = (cartTotal * discount.percent) / 100;
    if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
      discountAmount = discount.maxDiscountAmount;
    }
    return Math.floor(discountAmount);
  }

  async applyDiscount(code: string, cartTotal: number, userId?: number): Promise<{ discountAmount: number; discountCode: DiscountCode }> {
    const discount = await this.validateDiscount(code, cartTotal, userId);
    const discountAmount = await this.calculateDiscount(discount, cartTotal);
    // افزایش تعداد استفاده
    discount.usedCount += 1;
    await this.discountRepo.save(discount);
    return { discountAmount, discountCode: discount };
  }

  // ادمین
  async create(dto: CreateDiscountDto): Promise<DiscountCode> {
    const existing = await this.discountRepo.findOneBy({ code: dto.code });
    if (existing) throw new BadRequestException('کد تخفیف تکراری است');
    const discount = this.discountRepo.create(dto);
    return this.discountRepo.save(discount);
  }

  async findAll(): Promise<DiscountCode[]> {
    return this.discountRepo.find();
  }

  async findOne(id: number): Promise<DiscountCode> {
    const discount = await this.discountRepo.findOneBy({ id });
    if (!discount) throw new NotFoundException('کد تخفیف یافت نشد');
    return discount;
  }

  async update(id: number, dto: Partial<CreateDiscountDto>): Promise<DiscountCode> {
    await this.findOne(id);
    await this.discountRepo.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.discountRepo.delete(id);
  }
}