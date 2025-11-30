import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile: string;

  @Column()
  nama: string;

  @Column()
  team_ke: number;

  @Column()
  posisi: string;

  @Column()
  linkedin: string;

  @Column({nullable: true})
  instagram: string;

  @Column({nullable: true})
  deskripsi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
