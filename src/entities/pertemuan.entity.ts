import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn , UpdateDateColumn, JoinColumn} from "typeorm";
import { Absen } from "./absen.entity";
import { Kelas } from "./kelas.entity";
import { Materi } from "./materi.entity";
import { Tugas } from "./tugas.entity";
import { Pertanyaan } from "./pertanyaan.entity";

export type Metode = 'online' | 'offline';

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

    @Column()
    lokasi: string

    @Column({ type: 'enum', enum: ['online' , 'offline'] })
    metode: Metode

    @Column({type: 'time'})
    waktu_awal: string

    @Column({type: 'time'})
    waktu_akhir: string

    @Column({default: false})
    akhir: boolean

    @OneToMany(() => Absen, (absen) => absen.pertemuan, {cascade: true, onDelete : 'CASCADE'})
    absen: Absen[];

    @OneToMany(() => Materi, (materi) => materi.pertemuan, {cascade: true, onDelete : 'CASCADE'})
    materi: Materi[];

    @OneToMany(() => Tugas, (tugas) => tugas.pertemuan, {cascade: true, onDelete : 'CASCADE'})
    tugas: Tugas[];

    @OneToMany(() => Pertanyaan, (pertanyaan) => pertanyaan.pertemuan, {cascade: true, onDelete : 'CASCADE'})
    pertanyaan: Pertanyaan[];

    @ManyToOne(() => Kelas, (kelas) => kelas.pertemuan, {onDelete : 'CASCADE'})
    kelas: Kelas

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}