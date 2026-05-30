import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('banned_identities')
export class BannedIdentity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  bannedAt!: Date;
}