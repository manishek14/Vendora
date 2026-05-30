import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service'; // بعداً ساخته می‌شود
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../../database/entities/product.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private cartService: CartService,
    private userService: UserService,
    private walletService: WalletService,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    const isFullyVerified = await this.userService.isFullyVerified(userId);
    if (!isFullyVerified) {
      throw new BadRequestException('لطفاً ابتدا شماره موبایل خود را تأیید و یک آدرس اضافه کنید.');
    }

    const cartItems = await this.cartService.getCart(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('سبد خرید شما خالی است.');
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`موجودی محصول "${item.product.title}" کافی نیست.`);
      }
    }

    let totalAmount = 0;
const orderItemsData: {
  product: Product;
  vendor: User;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}[] = [];

for (const item of cartItems) {
  const itemTotal = item.priceAtTime * item.quantity;
  totalAmount += itemTotal;
  orderItemsData.push({
    product: item.product,
    vendor: item.product.vendor, // حالا vendor در دسترس است
    quantity: item.quantity,
    unitPrice: item.priceAtTime,
    totalPrice: itemTotal,
  });
}

    const shippingCost = 0;

    let discountAmount = 0;
    let finalAmount = totalAmount + shippingCost - discountAmount;

    const walletBalance = await this.walletService.getBalance(userId);
    let walletToUse = 0;
    let remainingAmount = finalAmount;
    if (dto.maxWalletAmountToUse && dto.maxWalletAmountToUse > 0) {
      walletToUse = Math.min(dto.maxWalletAmountToUse, walletBalance, finalAmount);
      remainingAmount = finalAmount - walletToUse;
    }

    const order = this.orderRepo.create({
      user: { id: userId },
      shippingAddress: { id: dto.shippingAddressId },
      totalAmount,
      shippingCost,
      discountAmount,
      finalAmount,
      walletAmountUsed: walletToUse,
      remainingAmount,
      status: OrderStatus.PENDING_PAYMENT,
    });
    const savedOrder = await this.orderRepo.save(order);

    for (const itemData of orderItemsData) {
      const orderItem = this.orderItemRepo.create({
        ...itemData,
        order: savedOrder,
      });
      await this.orderItemRepo.save(orderItem);
    }

    await this.cartService.clearCart(userId);

    return savedOrder;
  }

  async getUserOrders(userId: number) {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['shippingAddress'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(userId: number, orderId: number, isAdmin: boolean) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'shippingAddress'],
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    if (!isAdmin && order.user.id !== userId)
      throw new ForbiddenException('دسترسی ندارید');
    return order;
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    order.status = status;
    return this.orderRepo.save(order);
  }
}