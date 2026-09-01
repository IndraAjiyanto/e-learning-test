import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type No = 1 | 2 | 3 | 4;

@Entity()
export class GambarBenefit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gambar: string;

  @Column({ type: 'enum', enum: [1, 2, 3, 4] })
  no: No;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
