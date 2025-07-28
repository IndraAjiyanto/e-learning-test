import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn , UpdateDateColumn} from "typeorm";
import { Absen } from "./absen.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class Pertemuan{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    topik: string

    @Column()
    tanggal: Date

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

    @OneToMany(() => Absen, absen => absen.pertemuan)
    absen: Absen[];

    @ManyToOne(() => Pertemuan, pertemuan => pertemuan.kelas)
    kelas: Kelas[]
}