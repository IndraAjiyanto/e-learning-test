import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile: string;

  @Column({ name: 'nama' })
  name: string;

  @Column()
  teamOrder: number;

  @Column('jsonb', { name: 'posisi', nullable: true })
  position: string[];

  @Column()
  linkedin: string;

  @Column({ nullable: true })
  instagram: string;

  @Column('jsonb', { name: 'deskripsi', nullable: true })
  description: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
