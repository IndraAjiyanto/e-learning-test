import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pertemuan } from "./pertemuan.entity";
import { JawabanTugas } from "./jawaban_tugas.entity";

@Entity()
export class Tugas{
    @PrimaryGeneratedColumn()
    id: number

        @Column()
    judul: string;
    
    @Column()
    file: string

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;

          @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.tugas, {onDelete : 'CASCADE'})
          pertemuan: Pertemuan

                @OneToMany(() => JawabanTugas, (jawaban_tugas) => jawaban_tugas.tugas, { cascade: true, onDelete : 'CASCADE' })
                jawaban_tugas: JawabanTugas[];
}