import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Kelas } from './kelas.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class UserKelas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  progres: boolean;

  @ManyToOne(() => User, (user) => user.user_kelas, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @ManyToOne(() => Kelas, (kelas) => kelas.user_kelas, { onDelete: 'CASCADE' })
  @Exclude()
  kelas: Kelas;
}
