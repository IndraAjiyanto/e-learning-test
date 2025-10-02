import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kelas } from "./kelas.entity";
import { BenefitKelas } from "./benefit_kelas.entity";
import { AlurKelas } from "./alur_kelas.entity";


@Entity()
export class Kategori{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nama_kategori: string

    @Column()
    icon: string

    @Column()
    deskripsi: string

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

            @OneToMany(() => Kelas, (kelas) => kelas.kategori)
            kelas: Kelas[]

            @OneToMany(() => BenefitKelas, (benefit_kelas) => benefit_kelas.kategori)
            benefit_kelas: BenefitKelas[]
            
            @OneToMany(() => AlurKelas, (alur_kelas) => alur_kelas.kategori)
            alur_kelas: AlurKelas[]

}