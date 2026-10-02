import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Partner } from './partner.entity';

@Entity()
export class CategoryPartner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Partner, (partner) => partner.categoryPartner)
  partners: Partner[];
}
