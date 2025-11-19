import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  isi: string;

  @Column()
  experience_ke: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
