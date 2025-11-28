import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Translation } from './translation.entity';

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

  @Column()
  instagram: string;

  @Column({nullable: true})
  deskripsi: string;

        @OneToOne(() => Translation, (translation) => translation.team)
        translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
