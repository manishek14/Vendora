import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Order } from '../../database/entities/order.entity';
import { Product } from '../../database/entities/product.entity';
import { Ticket } from '../../modules/tickets/entities/ticket.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalOrders, totalProducts, openTickets] = await Promise.all([
      this.userRepo.count(),
      this.orderRepo.count(),
      this.productRepo.count(),
      this.ticketRepo.count({ where: { replyTo: undefined } }),
    ]);

    const revenueResult = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.finalAmount)', 'total')
      .where('order.status = :status', { status: 'delivered' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total ?? '0') || 0;

    const recentOrders = await this.orderRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const topProducts = await this.productRepo.find({
      order: { avgRating: 'DESC' },
      take: 5,
      relations: ['category'],
    });

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      openTickets,
      totalRevenue,
      recentOrders,
      topProducts,
    };
  }

  async getUserStats() {
    const total = await this.userRepo.count();
    const banned = await this.userRepo.count({ where: { isBanned: true } });
    const verified = await this.userRepo.count({ where: { isPhoneVerified: true } });
    return { total, banned, verified, unverified: total - verified };
  }

  async getOrderStats() {
    const statuses = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    const stats: Record<string, number> = {};
    for (const status of statuses) {
      stats[status] = await this.orderRepo.count({ where: { status: status as any } });
    }
    return stats;
  }
}
