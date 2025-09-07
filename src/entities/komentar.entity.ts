import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JawabanTugas } from "./jawaban_tugas.entity";

@Entity()
export class Komentar{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    komentar: string

@ManyToOne(() => JawabanTugas, (jawaban_tugas) => jawaban_tugas.komentar)
jawaban_tugas: JawabanTugas


            @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;
}