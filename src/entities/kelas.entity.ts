import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany} from "typeorm";
import { User } from "./user.entity";
import { Materi } from "./materi.entity";
import { Pertemuan } from "./pertemuan.entity";

@Entity()
export class Kelas {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nama_kelas: string;

    @Column()
    deskripsi: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

@ManyToMany(() => User, (user) => user.kelas)
user: User[];


    @OneToMany(() => Materi, (materi) => materi.kelas)
    materi: Materi[]

    @OneToMany(() => Pertemuan, (pertemuan) => pertemuan.kelas)
    pertemuan: Pertemuan[]
}
