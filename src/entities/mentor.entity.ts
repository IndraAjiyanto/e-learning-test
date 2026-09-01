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
import { Exclude } from 'class-transformer';

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @Exclude()
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
  @Exclude()
  kelas: Kelas;
}
