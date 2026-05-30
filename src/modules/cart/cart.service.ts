import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../../database/entities/cart-item.entity';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async getCart(userId: number): Promise<CartItem[]> {
    return this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { addedAt: 'ASC' },
    });
  }

  async addToCart(userId: number, productId: number, quantity: number): Promise<CartItem> {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    if (product.stock < quantity) {
      throw new BadRequestException('موجودی محصول کافی نیست');
    }

    let cartItem = await this.cartRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      if (product.stock < cartItem.quantity) {
        throw new BadRequestException('موجودی محصول کافی نیست');
      }
      return this.cartRepo.save(cartItem);
    } else {
      const newItem = this.cartRepo.create({
        user: { id: userId },
        product,
        quantity,
        priceAtTime: product.price,
      });
      return this.cartRepo.save(newItem);
    }
  }

  async updateQuantity(userId: number, cartItemId: number, quantity: number): Promise<CartItem> {
    const cartItem = await this.cartRepo.findOne({
      where: { id: cartItemId, user: { id: userId } },
      relations: ['product'],
    });
    if (!cartItem) throw new NotFoundException('آیتمی در سبد خرید با این شناسه یافت نشد');

    if (cartItem.product.stock < quantity) {
      throw new BadRequestException('موجودی محصول کافی نیست');
    }
    cartItem.quantity = quantity;
    return this.cartRepo.save(cartItem);
  }

  async removeItem(userId: number, cartItemId: number): Promise<void> {
    const result = await this.cartRepo.delete({ id: cartItemId, user: { id: userId } });
    if (result.affected === 0) throw new NotFoundException('آیتمی یافت نشد');
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepo.delete({ user: { id: userId } });
  }
}