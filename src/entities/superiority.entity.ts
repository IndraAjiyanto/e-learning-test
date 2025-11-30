import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";
import { Translation } from "./translation.entity";

@Entity()
export class Superiority {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb', { nullable: true })
    title: string[];

    @Column('jsonb', { nullable: true })
    description: string[];


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

          @ManyToOne(() => Kategori, (kategori) => kategori.superiority, {
            onDelete: 'CASCADE',
          })
          kategori: Kategori;
}