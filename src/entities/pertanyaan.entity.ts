import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Jawaban } from "./jawaban.entity";
import { Materi } from "./materi.entity";

@Entity()
export class Pertanyaan{
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    pertanyaan_soal:string

    @Column()
    nilai: number

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;

      @ManyToOne(() => Materi, (materi) => materi.pertanyaan)
      materi: Materi

      @OneToMany(() => Jawaban, (jawaban) => jawaban.pertanyaan, { cascade: true })
      jawaban: Jawaban[];
}