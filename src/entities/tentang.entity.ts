import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tentang {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  judul: string[];

  @Column('jsonb', { nullable: true })
  text: string[];

  @Column()
  gambar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
