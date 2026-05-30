import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description?: string;

  @Column({ type: 'bigint' })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'jsonb', nullable: true })
  dynamicAttributes!: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @Column({ default: false })
  isFeatured!: boolean;

  @Column({ default: false })
  isSpecial!: boolean;

  @Column({ default: false })
  isApproved!: boolean;

  @Column({ nullable: true })
  approvedAt!: Date;

  @Column({ nullable: true })
  approvedBy!: number;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images!: ProductImage[];

  @Column({ type: 'float', default: 0 })
  avgRating!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  vendor!: User;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  category!: Category;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL' })
  brand!: Brand;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}