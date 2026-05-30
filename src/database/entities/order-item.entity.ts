import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'bigint' })
  unitPrice!: number;

  @Column({ type: 'bigint' })
  totalPrice!: number;

  @ManyToOne(() => Order, (order) => order.id, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => Product)
  product!: Product;

  @ManyToOne(() => User)
  vendor!: User;
}