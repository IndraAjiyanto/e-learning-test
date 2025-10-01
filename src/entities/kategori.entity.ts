import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kelas } from "./kelas.entity";
import { PertanyaanKelas } from "./pertanyaan_kelas.entity";


@Entity()
export class Kategori{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nama_kategori: string

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

            @OneToMany(() => Kelas, (kelas) => kelas.kategori)
            kelas: Kelas[]


}