import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, ManyToOne} from "typeorm";
import { User } from "./user.entity";
import { Pertemuan } from "./pertemuan.entity";
import { Portfolio } from "./portfolio.entity";
import { Kategori } from "./kategori.entity";
import { Pembayaran } from "./pembayaran.entity";

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

@Column({ default: false })
launch: boolean;

    @Column()
    teknologi: string

    @Column()
    informasi_kelas: string

    @Column()
    target_pembelajaran: string

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

@ManyToMany(() => User, (user) => user.kelas, {onDelete : 'CASCADE'})
user: User[];

    @OneToMany(() => Pertemuan, (pertemuan) => pertemuan.kelas, {cascade: true, onDelete : 'CASCADE'})
    pertemuan: Pertemuan[]

    @OneToMany(() => Portfolio, (portfolio) => portfolio.kelas, { cascade: true , onDelete : 'CASCADE'})
      portfolio: Portfolio[];

    @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.kelas, { cascade: true, onDelete : 'CASCADE' })
    pembayaran: Pembayaran[];

          @ManyToOne(() => Kategori, (kategori) => kategori.kelas)
          kategori: Kategori
}
