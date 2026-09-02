import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  missionOrder: number;

  @Column('jsonb', { nullable: true })
  content: string[];

  @Column('jsonb', { nullable: true })
  items: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
