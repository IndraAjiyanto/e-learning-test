import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kelas } from './kelas.entity';
import { Teknologi } from './teknologi.entity';

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column('jsonb', { nullable: true })
  posisi: string[];

  @Column()
  linkedin: string;

  @ManyToMany(() => Teknologi, (teknologi) => teknologi.mentors, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'mentor_teknologi',
    joinColumn: { name: 'mentorId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'teknologiId', referencedColumnName: 'id' },
  })
  teknologi: Teknologi[];

  @Column()
  profile: string;

  @Column('jsonb', { nullable: true })
  deskripsi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Kelas, (kelas) => kelas.mentor, { onDelete: 'CASCADE' })
  kelas: Kelas;
}
