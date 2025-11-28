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
import { Translation } from './translation.entity';

@Entity()
export class Alumni {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile: string;

  @Column()
  nama: string;

  @Column()
  pesan: string;

  @Column()
  alumni: string;

  @Column()
  posisi_sekarang: string;

  @ManyToOne(() => Kelas, (kelas) => kelas.alumni, { onDelete: 'CASCADE' })
  kelas: Kelas;

        @OneToOne(() => Translation, (translation) => translation.alumni)
        translation: Translation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
