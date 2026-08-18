import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";
import { noGallery } from "./types/no-gallery";

@Entity('gallery')
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number 

    @Column()
    filePath:string

    @Column()
    title:string

    @Column({nullable:true})
    description: string

    @Column({type:'enum', enum: [ '1', '2', '3', '4', '5', '6' ], nullable:true})
    no:noGallery

     @ManyToOne(() => Category, (category) => category.gallery, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  @Exclude()
  category: Category;
}
