import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Background {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { nullable: true })
  content: string[];

  @Column('jsonb', { nullable: true })
  details: string[];

  @Column({ nullable: true })
  backgroundOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
