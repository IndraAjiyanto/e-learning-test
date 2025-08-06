import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn , UpdateDateColumn} from "typeorm";
import { Absen } from "./absen.entity";
import { Kelas } from "./kelas.entity";
import { Materi } from "./materi.entity";

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

    @OneToMany(() => Absen, (absen) => absen.pertemuan)
    absen: Absen[];

    @OneToMany(() => Materi, (materi) => materi.pertemuan)
    materi: Materi[];

    @ManyToOne(() => Kelas, (kelas) => kelas.pertemuan)
    kelas: Kelas

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;


}