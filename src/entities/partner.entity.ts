import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryPartner } from './category_partner.entity';

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gambar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

   @ManyToOne(
    () => CategoryPartner,
    (categoryPartner) => categoryPartner.partners,
    {
      nullable: false,
      onDelete: "CASCADE", // opsional, sesuaikan kebutuhan
    },
  )
  @JoinColumn({ name: "categoryPartnerId" })
  categoryPartner: CategoryPartner;

}
