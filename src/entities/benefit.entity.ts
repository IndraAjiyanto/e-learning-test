import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type No = 1 | 2 | 3;

@Entity()
export class Benefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  judul: string[];

  @Column('jsonb', { nullable: true })
  text: string[];

  @Column()
  icon: string;

  @Column({ type: 'enum', enum: [1, 2, 3] })
  no: No;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
