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

    @OneToMany(() => Absen, (absen) => absen.pertemuan)
    absen: Absen[];

    @ManyToOne(() => Kelas, (kelas) => kelas.pertemuan)
    kelas: Kelas

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;


}