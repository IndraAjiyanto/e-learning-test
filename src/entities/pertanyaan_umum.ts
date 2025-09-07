import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class PertanyaanUmum{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    pertanyaan: string

    @Column()
    jawaban: string

                @CreateDateColumn()
                createdAt: Date;
                
                @UpdateDateColumn()
                updatedAt: Date;
}