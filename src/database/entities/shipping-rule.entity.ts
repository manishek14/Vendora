import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shipping_rules')
export class ShippingRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fromCity!: string;

  @Column()
  toCity!: string;

  @Column({ type: 'int' })
  weightMinGr!: number;

  @Column({ type: 'int' })
  weightMaxGr!: number;

  @Column({ type: 'bigint' })
  cost!: number;

  @Column({ default: 'پست پیشتاز' })
  methodName!: string;

  @Column({ default: 3 })
  estimatedDays!: number;

  @Column({ default: true })
  isActive!: boolean;
}