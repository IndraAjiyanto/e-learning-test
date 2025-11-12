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

  @Column()
  judul: string;

  @Column()
  text: string;

  @Column()
  icon: string;

  @Column({ type: 'enum', enum: [1, 2, 3] })
  no: No;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
