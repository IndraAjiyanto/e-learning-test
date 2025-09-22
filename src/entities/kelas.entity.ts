import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, OneToOne, JoinColumn} from "typeorm";
import { User } from "./user.entity";
import { Portfolio } from "./portfolio.entity";
import { Kategori } from "./kategori.entity";
import { Pembayaran } from "./pembayaran.entity";
import { Logbook } from "./logbook.entity";
import { Minggu } from "./minggu.entity";
import { Alumni } from "./alumni.entity";
import { Sertifikat } from "./sertifikat.entity";
import { JenisKelas } from "./jenis_kelas.entity";

export type Metode = 'online' | 'offline';


@Entity()
export class Kelas {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nama_kelas: string;

    @Column()
    deskripsi: string;

    @Column()
    gambar: string;

    @Column()
    harga: number;

    @Column()
    promo: number;

        @Column()
    lokasi: string

        @Column({ type: 'enum', enum: ['online' , 'offline'] })
    metode: Metode

    @Column("jsonb")
    kriteria: string[]

@Column({ default: false })
launch: boolean;

    @Column("jsonb")
    teknologi: string[]

    @Column("jsonb")
    materi: string[];

    @Column("jsonb")
    target_pembelajaran: string[]

    @Column()
    kuota: number

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

@ManyToMany(() => User, (user) => user.kelas, {onDelete : 'CASCADE'})
user: User[];

    @OneToMany(() => Minggu, (minggu) => minggu.kelas, {cascade: true, onDelete : 'CASCADE'})
    minggu: Minggu[]

    @OneToMany(() => Portfolio, (portfolio) => portfolio.kelas, { cascade: true , onDelete : 'CASCADE'})
      portfolio: Portfolio[];

    @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.kelas, { cascade: true, onDelete : 'CASCADE' })
    pembayaran: Pembayaran[];

    @OneToMany(() => Logbook, (logbook) => logbook.kelas, { cascade: true, onDelete : 'CASCADE' })
    logbook: Logbook[];

          @ManyToOne(() => Kategori, (kategori) => kategori.kelas, {onDelete : 'CASCADE'})
          kategori: Kategori

          @ManyToOne(() => JenisKelas, (jenis_kelas) => jenis_kelas.kelas, {onDelete : 'CASCADE'})
          @JoinColumn({ name: "jenis_kelasId" }) 
          jenis_kelas: JenisKelas
    
        @OneToMany(() => Alumni, (alumni) => alumni.kelas, {cascade: true, onDelete : 'CASCADE'})
        alumni: Alumni[]

        @OneToMany(() => Sertifikat, (sertifikat) => sertifikat.kelas, {cascade: true, onDelete : 'CASCADE'})
        sertifikat: Sertifikat[]
}
