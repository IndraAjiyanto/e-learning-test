import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pertanyaan } from "./pertanyaan.entity";

@Entity()
export class Jawaban{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    jawaban: string

@Column({ default: false })
jawaban_benar: boolean;

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

                              @ManyToOne(() => Pertanyaan, (pertanyaan) => pertanyaan.jawaban)
                              pertanyaan: Pertanyaan
}