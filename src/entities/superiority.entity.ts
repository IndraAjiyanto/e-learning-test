import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";
import { Translation } from "./translation.entity";

@Entity()
export class Superiority {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @OneToOne(() => Translation, (translation) => translation.superiority)
    translation: Translation;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

          @ManyToOne(() => Kategori, (kategori) => kategori.superiority, {
            onDelete: 'CASCADE',
          })
          kategori: Kategori;
}