import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Commitment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  title: string[];

  @Column('jsonb', { nullable: true })
  description: string[];

  @Column()
  icon: string;

  @Column({ nullable: true })
  commitmentOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
