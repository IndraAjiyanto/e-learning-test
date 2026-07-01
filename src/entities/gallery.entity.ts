import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Kategori } from "./kategori.entity";

@Entity()
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number 

    @Column()
    file_path:string

    @Column()
    title:string

    @Column()
    description: string

     @ManyToOne(() => Kategori, (kategori) => kategori.gallery, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kategori_id' })
  @Exclude()
  kategori: Kategori;
}
