import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { Product } from '../../database/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(userId: number, productId: number, dto: CreateReviewDto) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const existing = await this.reviewRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) throw new BadRequestException('قبلاً نظر ثبت کرده‌اید');

    const review = this.reviewRepo.create({
      ...dto,
      user: { id: userId } as any,
      product: { id: productId } as any,
      isApproved: false,
    });
    const saved = await this.reviewRepo.save(review);
    return saved;
  }

  async findByProduct(productId: number) {
    return this.reviewRepo.find({
      where: { product: { id: productId }, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPending() {
    return this.reviewRepo.find({
      where: { isApproved: false },
      relations: ['user', 'product'],
      order: { createdAt: 'ASC' },
    });
  }

  async approve(id: number) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!review) throw new NotFoundException('نظر یافت نشد');
    review.isApproved = true;
    await this.reviewRepo.save(review);
    await this.recalcAvgRating(review.product.id);
    return review;
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
    if (!review) throw new NotFoundException('نظر یافت نشد');
    if (!isAdmin && review.user.id !== userId)
      throw new ForbiddenException('دسترسی ندارید');
    const productId = review.product.id;
    await this.reviewRepo.remove(review);
    await this.recalcAvgRating(productId);
    return { message: 'نظر حذف شد' };
  }

  private async recalcAvgRating(productId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .where('r.productId = :productId AND r.isApproved = true', { productId })
      .getRawOne();
    const avg = parseFloat(result?.avg ?? '0') || 0;
    await this.productRepo.update(productId, { avgRating: avg });
  }
}
