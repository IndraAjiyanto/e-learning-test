import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Award {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  content: string[];

  @Column('jsonb', { nullable: true })
  details: string[];

  @Column({nullable:true})
  awardOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
