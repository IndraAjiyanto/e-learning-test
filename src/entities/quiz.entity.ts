import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pertanyaan } from "./pertanyaan.entity";
import { Nilai } from "./nilai.entity";
import { Minggu } from "./minggu.entity";

@Entity()
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number 

    @Column()
    nama_quiz: string

    @Column()
    nilai_minimal: number

                @CreateDateColumn()
                createdAt: Date;
                
                @UpdateDateColumn()
                updatedAt: Date;

    @OneToMany(() => Pertanyaan, (pertanyaan) => pertanyaan.quiz, { cascade: true, onDelete : 'CASCADE' })
    pertanyaan: Pertanyaan[]

    @OneToMany(() => Nilai, (nilai) => nilai.quiz, { cascade: true, onDelete : 'CASCADE' })
    nilai: Nilai[]

    @ManyToOne(() => Minggu, (minggu) => minggu.quiz, {onDelete : 'CASCADE'})
    minggu: Minggu
}