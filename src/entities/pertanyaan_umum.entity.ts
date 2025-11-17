import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type For =
  | 'wip'
  | 'in-house-training'
  | 'general'
  | 'short_class'
  | 'bootcamp'
  | 'course';

@Entity()
export class PertanyaanUmum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pertanyaan: string;

  @Column()
  jawaban: string;

  @Column({
    type: 'enum',
    enum: ['wip', 'in-house-training', 'general', 'short_class', 'bootcamp', 'course'],
    default: 'general',
  })
  for: For;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
