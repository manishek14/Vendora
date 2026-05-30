import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'پرداخت نشده',
  WAITING_APPROVAL = 'در انتظار تایید',
  READY_TO_SHIP = 'آماده ارسال',
  SHIPPED = 'ارسال شده',
  DELIVERED = 'تحویل داده شده',
  RETURNED = 'برگشت خورده',
  ONGOING = 'جاری',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bigint' })
  totalAmount!: number;

  @Column({ type: 'bigint' })
  shippingCost!: number;

  @Column({ type: 'bigint', default: 0 })
  discountAmount!: number;

  @Column({ type: 'bigint' })
  finalAmount!: number; 

  @Column({ type: 'bigint', default: 0 })
  walletAmountUsed!: number;

  @Column({ type: 'bigint', default: 0 })
  remainingAmount!: number; 

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status!: OrderStatus;

  @Column({ nullable: true })
  paymentGateway!: string;

  @Column({ nullable: true })
  paymentAuthority!: string;

  @Column({ nullable: true })
  paymentRefId!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Address)
  shippingAddress!: Address;

  @Column({ nullable: true })
  trackingCode!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}