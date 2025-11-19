import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Misi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  misi_ke: number

  @Column()
  content: string;

  @Column()
  isi: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
