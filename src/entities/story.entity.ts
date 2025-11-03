import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Story {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paragraph: string;

    @Column()
    no: number;

          @CreateDateColumn()
          createdAt: Date;
        
          @UpdateDateColumn()
          updatedAt: Date;
}