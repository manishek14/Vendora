import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { ViolationItem } from './violation-item.entity';

export enum BanType {
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent',
}

@Entity('user_bans')
export class UserBan {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => ViolationItem, { nullable: true })
  violationItem!: ViolationItem | null;

  @ManyToOne(() => User)
  bannedBy!: User;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'enum', enum: BanType })
  punishmentType!: BanType;

  @Column({ type: 'int', nullable: true })
  durationDays!: number | null;

  @Column({ type: 'timestamptz' })
  startDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate!: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}