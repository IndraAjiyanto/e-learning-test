import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('visions')
export class Vision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  visions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
