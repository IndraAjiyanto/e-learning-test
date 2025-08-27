import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn , UpdateDateColumn, JoinColumn} from "typeorm";
import { Absen } from "./absen.entity";
import { Kelas } from "./kelas.entity";
import { Materi } from "./materi.entity";
import { Tugas } from "./tugas.entity";
import { Pertanyaan } from "./pertanyaan.entity";

@Entity()
export class Pertemuan{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    topik: string

    @Column()
    pertemuan_ke: number

    @Column()
    tanggal: Date

    @Column({type: 'time'})
    waktu_awal: string

    @Column({type: 'time'})
    waktu_akhir: string

    @Column({default: false})
    akhir: boolean

    @OneToMany(() => Absen, (absen) => absen.pertemuan)
    absen: Absen[];

    @OneToMany(() => Materi, (materi) => materi.pertemuan)
    materi: Materi[];

    @OneToMany(() => Tugas, (tugas) => tugas.pertemuan)
    tugas: Tugas[];

    @OneToMany(() => Pertanyaan, (pertanyaan) => pertanyaan.pertemuan)
    pertanyaan: Pertanyaan[];

    @ManyToOne(() => Kelas, (kelas) => kelas.pertemuan)
    kelas: Kelas

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}