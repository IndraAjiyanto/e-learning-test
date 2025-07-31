import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Kelas } from "./kelas.entity";

export type JenisFile = 'video'| 'pdf'| 'ppt';

@Entity()
export class Materi {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    file: string;

    @Column({ type: 'enum', enum: ['video', 'pdf', 'ppt'] })
    jenis_file: JenisFile;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Kelas, (kelas) => kelas.materi)
    kelas: Kelas
}
