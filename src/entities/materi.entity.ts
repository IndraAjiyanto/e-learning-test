import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Pertemuan } from "./pertemuan.entity";

export type JenisFile = 'video'| 'pdf'| 'ppt';

@Entity()
export class Materi {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    judul: string;

    @Column()
    file: string;

    @Column({ type: 'enum', enum: ['video', 'pdf', 'ppt'] })
    jenis_file: JenisFile;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.materi)
    pertemuan: Pertemuan
}
