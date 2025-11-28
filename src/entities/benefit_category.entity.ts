import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";
import { Translation } from "./translation.entity";

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

            @OneToOne(() => Translation, (translation) => translation.benefit_category)
            translation: Translation;
}