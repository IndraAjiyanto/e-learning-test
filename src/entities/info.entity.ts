import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Info{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    judul: string

    @Column()
    text: string

    @Column()
    icon: string

                @CreateDateColumn()
                createdAt: Date;
                
                @UpdateDateColumn()
                updatedAt: Date;
}