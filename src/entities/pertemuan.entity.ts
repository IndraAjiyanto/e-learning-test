import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn , UpdateDateColumn, JoinColumn} from "typeorm";
import { Absen } from "./absen.entity";
import { Materi } from "./materi.entity";
import { Tugas } from "./tugas.entity";
import { Minggu } from "./minggu.entity";
import { ProgresPertemuan } from "./progres_pertemuan.entity";
import { Logbook } from "./logbook.entity";
import { LogbookMentor } from "./logbook_mentor.entity";


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

    @ManyToOne(() => Minggu, (minggu) => minggu.pertemuan, {onDelete : 'CASCADE'})
    minggu: Minggu

    @OneToMany(() => ProgresPertemuan, (progres_pertemuan) => progres_pertemuan.pertemuan, { cascade: true, onDelete: 'CASCADE' })
    progres_pertemuan: ProgresPertemuan[];

        @OneToMany(() => Logbook, (logbook) => logbook.pertemuan, { cascade: true, onDelete : 'CASCADE' })
        logbook: Logbook[];

        @OneToMany(() => LogbookMentor, (logbook_mentor) => logbook_mentor.pertemuan, { cascade: true, onDelete : 'CASCADE' })
        logbook_mentor: LogbookMentor[];

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}