import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kelas } from "./kelas.entity";

@Entity()
export class JenisKelas{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nama_jenis_kelas: string


        @Column()
    icon: string

    @Column()
    deskripsi: string

            @OneToMany(() => Kelas, (kelas) => kelas.jenis_kelas)
            kelas: Kelas[]

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;
}