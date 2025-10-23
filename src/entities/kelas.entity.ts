import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, OneToOne, JoinColumn} from "typeorm";
import { User } from "./user.entity";
import { Portfolio } from "./portfolio.entity";
import { Kategori } from "./kategori.entity";
import { Pembayaran } from "./pembayaran.entity";
import { Minggu } from "./minggu.entity";
import { Sertifikat } from "./sertifikat.entity";
import { JenisKelas } from "./jenis_kelas.entity";
import { UserKelas } from "./user_kelas.entity";
import { PertanyaanKelas } from "./pertanyaan_kelas.entity";
import { Mentor } from "./mentor.entity";
import { Alumni } from "./alumni.entity";

export type Metode = 'online' | 'offline';
export type Proses = 'acc' | 'proces' | 'rejected';

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

    @Column({ nullable: true })
    harga: number;

    @Column({ nullable: true })
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

        @Column({ type: 'enum', enum: ['acc' , 'proces' , 'rejected'], default: 'rejected' })
        proses: Proses

    @Column("jsonb")
    materi: string[];

    @Column("jsonb")
    target_pembelajaran: string[]

    @Column({ nullable: true })
    kuota: number

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

   @OneToMany(() => UserKelas, (user_kelas) => user_kelas.kelas, {cascade: true, onDelete : 'CASCADE'})
    user_kelas: UserKelas[]

    @OneToMany(() => Minggu, (minggu) => minggu.kelas, {cascade: true, onDelete : 'CASCADE'})
    minggu: Minggu[]

    @OneToMany(() => Alumni, (alumni) => alumni.kelas, {cascade: true, onDelete : 'CASCADE'})
    alumni: Alumni[]

    @OneToMany(() => Portfolio, (portfolio) => portfolio.kelas, { cascade: true , onDelete : 'CASCADE'})
      portfolio: Portfolio[];

    @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.kelas, { cascade: true, onDelete : 'CASCADE' })
    pembayaran: Pembayaran[];

          @ManyToOne(() => Kategori, (kategori) => kategori.kelas, {onDelete : 'CASCADE'})
          kategori: Kategori

          @ManyToOne(() => JenisKelas, (jenis_kelas) => jenis_kelas.kelas, {onDelete : 'CASCADE'})
          @JoinColumn({ name: "jenis_kelasId" }) 
          jenis_kelas: JenisKelas

        @OneToMany(() => Sertifikat, (sertifikat) => sertifikat.kelas, {cascade: true, onDelete : 'CASCADE'})
        sertifikat: Sertifikat[]

                    @OneToMany(() => PertanyaanKelas, (pertanyaan_kelas) => pertanyaan_kelas.kelas)
            pertanyaan_kelas: PertanyaanKelas[]

                    @OneToMany(() => Mentor, (mentor) => mentor.kelas)
            mentor: Mentor[]
}
