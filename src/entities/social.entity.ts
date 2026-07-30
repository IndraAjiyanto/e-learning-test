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
  instagram: string;

  @Column()
  youtube: string;

  @Column({ nullable: true })
  videoYoutube: string;

  @Column({ nullable: true })
  linkForm: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column()
  number: string;

  @Column('text')
  linkAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
