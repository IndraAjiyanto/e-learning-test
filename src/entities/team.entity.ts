import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile: string;

  @Column({ name: 'name', nullable:true })
  name: string;

  @Column({nullable:true})
  teamOrder: number;

  @Column('jsonb', { name: 'position', nullable: true })
  position: string[];

  @Column()
  linkedin: string;

  @Column({ nullable: true })
  instagram: string;

  @Column('jsonb', { name: 'description', nullable: true })
  description: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
