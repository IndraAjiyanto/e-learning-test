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

  @Column()
  nama: string;

  @Column()
  posisi: string;

  @Column()
  deskripsi: string;

  @Column()
  instagram: string;

  @Column()
  linkedin: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
