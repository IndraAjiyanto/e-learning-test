import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Commitment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  judul: string;

  @Column()
  deskripsi: string;

  @Column()
  icon: string;

  @Column()
  commitment_ke: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
