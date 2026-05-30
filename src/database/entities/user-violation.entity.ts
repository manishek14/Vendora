import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { ViolationItem } from './violation-item.entity';

@Entity('user_violations')
export class UserViolation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => ViolationItem)
  violationItem!: ViolationItem;

  @ManyToOne(() => User)
  createdBy!: User;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}