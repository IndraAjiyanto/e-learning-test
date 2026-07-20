import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Session } from './session.entity';
import { Exclude } from 'class-transformer';

export type FileType = 'video' | 'pdf' | 'ppt';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  file: string;

  @Column({ type: 'enum', enum: ['video', 'pdf', 'ppt'] })
 fileType: FileType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Session, (session) => session.materials, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  session: Session;
}
