import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'bigint' })
  priceAtTime!: number;  

  @CreateDateColumn({ type: 'timestamptz' })
  addedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product!: Product;
}