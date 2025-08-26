import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Tugas } from "./tugas.entity";

@Entity()
export class JawabanTugas{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    file: string

            @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;

                                          @ManyToOne(() => Tugas, (tugas) => tugas.jawaban_tugas)
                                          tugas: Tugas
}