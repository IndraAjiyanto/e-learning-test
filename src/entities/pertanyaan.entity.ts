import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Jawaban } from "./jawaban.entity";
import { Materi } from "./materi.entity";
import { JawabanUser } from "./jawaban_user.entity";
import { Pertemuan } from "./pertemuan.entity";

@Entity()
export class Pertanyaan{
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    pertanyaan_soal:string

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;

      @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.pertanyaan)
      pertemuan: Pertemuan

      @OneToMany(() => Jawaban, (jawaban) => jawaban.pertanyaan, { cascade: true })
      jawaban: Jawaban[];

      @OneToMany(() => JawabanUser, (jawaban_user) => jawaban_user.pertanyaan, { cascade: true })
      jawaban_user: JawabanUser[];
}