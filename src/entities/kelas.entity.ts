import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, ManyToOne} from "typeorm";
import { User } from "./user.entity";
import { Portfolio } from "./portfolio.entity";
import { Kategori } from "./kategori.entity";
import { Pembayaran } from "./pembayaran.entity";
import { Logbook } from "./logbook.entity";
import { Minggu } from "./minggu.entity";

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

    @Column("jsonb")
    teknologi: string[]

    @Column("jsonb")
    materi: string[];

    @Column("jsonb")
    target_pembelajaran: string[]

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

          @ManyToOne(() => Kategori, (kategori) => kategori.kelas)
          kategori: Kategori
}
