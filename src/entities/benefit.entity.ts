import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type No = 1 | 2 | 3 | 4 | 5;

@Entity()
export class Benefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  title: string[];

  @Column('jsonb', { nullable: true })
  description: string[];

  @Column()
  icon: string;

  @Column({ type: 'enum', enum: [1, 2, 3, 4, 5] })
  no: No;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
