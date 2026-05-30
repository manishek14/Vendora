import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;

  @Column({ type: 'bigint', default: 0 })
  balance!: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}