import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export type JenisKelamin = 'Laki laki' | 'Perempuan';
export type Pendidikan = 'SMP/Sederajat' | 'SMA/SMK/Sederajat' | 'Diploma(D3/D4)' | 'Sarjana(S1)';


@Entity()
export class Biodata{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nama_lengkap: string

    @Column()
    no: string

    @Column()
    jenis_kelamin: JenisKelamin

    @Column()
    kota: string

    @Column()
    pendidikan: Pendidikan

    @Column()
    program_studi: string

        @CreateDateColumn()
        createdAt: Date;
            
        @UpdateDateColumn()
        updatedAt: Date;

    @OneToOne(() => User, (user) => user.biodata)
    @JoinColumn()
    user: User

}
