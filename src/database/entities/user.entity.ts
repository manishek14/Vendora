import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Address } from './address.entity';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, unique: true })
  phone?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true })
  password?: string; 

  @Column({ default: false })
  isPhoneVerified!: boolean;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: false })
  isBanned!: boolean;

  @Column({ default: 0 })
  totalPurchaseAmount?: number; 

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses?: Address[];

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_roles' })
  roles!: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}