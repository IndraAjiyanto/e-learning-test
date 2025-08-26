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

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

@ManyToMany(() => User, (user) => user.kelas)
user: User[];

    @OneToMany(() => Pertemuan, (pertemuan) => pertemuan.kelas)
    pertemuan: Pertemuan[]

    @OneToMany(() => Portfolio, (portfolio) => portfolio.kelas, { cascade: true })
      portfolio: Portfolio[];

    @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.kelas, { cascade: true })
    pembayaran: Pembayaran[];

          @ManyToOne(() => Kategori, (kategori) => kategori.kelas)
          kategori: Kategori
}
