import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('team_leads')
export class TeamLead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile: string;

  @Column({ name: 'nama' })
  name: string;

  @Column('jsonb', { name: 'posisi', nullable: true })
  position: string[];

  @Column('jsonb', { name: 'deskripsi', nullable: true })
  description: string[];

  @Column()
  instagram: string;

  @Column()
  linkedin: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
