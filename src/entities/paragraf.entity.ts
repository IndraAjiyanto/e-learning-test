import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Paragraf {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  paragraf: string[];

  @Column()
  p_ke: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
