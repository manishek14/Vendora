import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ViolationItem } from './violation-item.entity';

@Entity('violation_categories')
export class ViolationCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @OneToMany(() => ViolationItem, (item) => item.category)
  items!: ViolationItem[];
}