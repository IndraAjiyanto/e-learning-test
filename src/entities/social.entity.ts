import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Social {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  linkedin: string;

  @Column()
  instragram: string;

  @Column()
  youtube: string;

  @Column({nullable: true})
  video_youtube: string;
  
  @Column()
  email: string;

  @Column()
  alamat: string;

  @Column()
  nomor: string;

  @Column('text')
  link_alamat: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
