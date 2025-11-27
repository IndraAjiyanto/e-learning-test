import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";

@Entity()
export class Superiority {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

          @ManyToOne(() => Kategori, (kategori) => kategori.superiority, {
            onDelete: 'CASCADE',
          })
          kategori: Kategori;
}