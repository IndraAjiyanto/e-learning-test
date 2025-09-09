import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Tugas } from "./tugas.entity";
import { Komentar } from "./komentar.entity";
import { User } from "./user.entity";

export type Proses = 'acc' | 'proces' | 'rejected';

@Entity()
export class JawabanTugas{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    file: string

    @Column()
    nilai: number

    @Column({ type: 'enum', enum: ['acc' , 'proces' , 'rejected'], default: 'rejected' })
    proses: Proses

            @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;

                                          @ManyToOne(() => Tugas, (tugas) => tugas.jawaban_tugas)
                                          tugas: Tugas
                        @OneToMany(() => Komentar, (komentar) => komentar.jawaban_tugas)
                        komentar: Komentar[]
                                          @ManyToOne(() => User, (user) => user.jawaban_tugas)
                                          user: User
}