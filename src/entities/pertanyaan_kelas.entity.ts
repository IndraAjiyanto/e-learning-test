import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class PertanyaanKelas{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    pertanyaan: string

    @Column()
    jawaban: string

                @CreateDateColumn()
                createdAt: Date;
                
                @UpdateDateColumn()
                updatedAt: Date;

          @ManyToOne(() => Kelas, (kelas) => kelas.pertanyaan_kelas, {onDelete : 'CASCADE'})
          kelas: Kelas

}