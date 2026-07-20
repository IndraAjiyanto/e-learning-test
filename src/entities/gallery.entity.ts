import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";

@Entity('gallery')
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number 

    @Column()
    file_path:string

    @Column()
    title:string

    @Column({nullable:true})
    description: string

     @ManyToOne(() => Category, (category) => category.gallery, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kategori_id' })
  @Exclude()
  category: Category;
}
