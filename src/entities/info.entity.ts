import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Info {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  title: string[];

  @Column('jsonb', { nullable: true })
  text: string[];

  @Column()
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
