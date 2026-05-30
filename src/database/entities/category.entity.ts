import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('categories')
@Tree('closure-table')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({ type: 'int', default: 0 })
  level!: number;

  @TreeParent()
  parent?: Category;

  @TreeChildren()
  children?: Category[];
}