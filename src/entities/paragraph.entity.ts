import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Paragraph {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  paragraphs: string[];

  @Column()
  paragraphOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
