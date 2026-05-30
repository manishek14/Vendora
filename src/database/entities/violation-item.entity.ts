import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ViolationCategory } from './violation-category.entity';
import { UserViolation } from './user-violation.entity';

export enum PunishmentType {
  WARNING = 'warning',
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent',
}

@Entity('violation_items')
export class ViolationItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'int', nullable: true })
  limit!: number;

  @Column({ type: 'enum', enum: PunishmentType, default: PunishmentType.WARNING })
  defaultPunishmentType!: PunishmentType;

  @Column({ type: 'int', nullable: true })
  defaultDurationDays!: number;

  @ManyToOne(() => ViolationCategory, (category) => category.items)
  category!: ViolationCategory;

  @OneToMany(() => UserViolation, (uv) => uv.violationItem)
  userViolations!: UserViolation[];
}