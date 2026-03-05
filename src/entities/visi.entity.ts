import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('visi')
export class Visi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  visi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
