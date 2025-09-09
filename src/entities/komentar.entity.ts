import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JawabanTugas } from "./jawaban_tugas.entity";

@Entity()
export class Komentar{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    komentar: string

@ManyToOne(() => JawabanTugas, (jawaban_tugas) => jawaban_tugas.komentar)
@JoinColumn({ name: "jawaban_tugasId" }) 
jawaban_tugas: JawabanTugas


            @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;
}