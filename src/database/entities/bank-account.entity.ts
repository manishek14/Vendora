import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  vendor!: User;

  @Column()
  iban!: string;

  @Column()
  cardNumber!: string;

  @Column()
  accountHolderName!: string;

  @Column({ default: true })
  isActive!: boolean;
}