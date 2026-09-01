import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('team_leads')
export class TeamLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  profile: string;

  @Column()
  nama: string;

  @Column('jsonb', { nullable: true })
  posisi: string[];

  @Column('jsonb', { nullable: true })
  deskripsi: string[];

  @Column()
  instagram: string;

  @Column()
  linkedin: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
