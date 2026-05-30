import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('withdrawal_requests')
export class WithdrawalRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  vendor!: User;

  @Column({ type: 'bigint' })
  amount!: number;

  @Column({ type: 'smallint' })
  feePercent!: number;

  @Column({ type: 'bigint' })
  feeAmount!: number;

  @Column({ type: 'bigint' })
  netAmount!: number;

  @Column({ nullable: true })
  bankAccountId!: number;

  @Column({ type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status!: WithdrawalStatus;

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column({ nullable: true })
  processedBy!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  requestedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt!: Date;

  @Column({ nullable: true })
  trackingCode!: string;
}