import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pertemuan } from "./pertemuan.entity";
import { JawabanTugas } from "./jawaban_tugas.entity";

@Entity()
export class Tugas{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    file: string

    @Column()
    judul: string

    @Column()
    nilai: number

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;

          @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.tugas)
          pertemuan: Pertemuan

                @OneToMany(() => JawabanTugas, (jawaban_tugas) => jawaban_tugas.tugas, { cascade: true })
                jawaban_tugas: JawabanTugas[];
}