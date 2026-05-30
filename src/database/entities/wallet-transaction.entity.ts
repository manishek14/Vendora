import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  PURCHASE = 'purchase',
  REFUND = 'refund', 
  SETTLEMENT_CREDIT = 'settlement_credit', 
  WITHDRAWAL_REQUEST = 'withdrawal_request',
  WITHDRAWAL_PAID = 'withdrawal_paid', 
  WITHDRAWAL_REJECTED = 'withdrawal_rejected', 
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'bigint' })
  amount!: number;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @Column({ nullable: true })
  referenceId!: string; 

  @Column({ nullable: true })
  description!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}