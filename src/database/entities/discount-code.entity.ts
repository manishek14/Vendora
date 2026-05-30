import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('discount_codes')
export class DiscountCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column({ type: 'int', comment: 'درصد تخفیف (0-100)' })
  percent!: number;

  @Column({ type: 'bigint', nullable: true, comment: 'حداکثر مبلغ تخفیف (تومان)' })
  maxDiscountAmount!: number;

  @Column({ type: 'bigint', nullable: true, comment: 'حداقل مبلغ سبد خرید برای اعمال تخفیف' })
  minCartAmount!: number;

  @Column({ type: 'int', nullable: true, comment: 'تعداد دفعات قابل استفاده' })
  usageLimit!: number;

  @Column({ type: 'int', default: 0, comment: 'تعداد دفعات استفاده شده' })
  usedCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}