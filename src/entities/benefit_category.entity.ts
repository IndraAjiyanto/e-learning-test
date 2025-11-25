import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";

@Entity()
export class BenefitCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    icon: string;

    @Column()
    title: string;

    @Column()
    description: string;

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;

        @ManyToOne(() => Kategori, (kategori) => kategori.benefit_category, {
          onDelete: 'CASCADE',
        })
        kategori: Kategori;
}