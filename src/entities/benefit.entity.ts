import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Benefit{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    judul: string

    @Column()
    text: string

                @CreateDateColumn()
                createdAt: Date;
                
                @UpdateDateColumn()
                updatedAt: Date;
}