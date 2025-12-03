import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Alumni {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile: string;

  @Column('jsonb', {nullable: true})
  nama: string[];

  @Column('jsonb', {nullable: true})
  pesan: string[];

  @Column('jsonb', {nullable: true})
  alumni: string[];

  @Column('jsonb', {nullable: true})
  posisi_sekarang: string[];

  @ManyToOne(() => Kelas, (kelas) => kelas.alumni, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
