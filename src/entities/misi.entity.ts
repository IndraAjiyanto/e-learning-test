import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Misi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  misi_ke: number

  @Column('jsonb',{nullable: true})
  content: string[];

  @Column('jsonb',{nullable: true})
  isi: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
