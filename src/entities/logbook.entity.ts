import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Pertemuan } from "./pertemuan.entity";

export type Proses = 'acc' | 'proces' | 'rejected';

@Entity()
export class Logbook {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    kegiatan: string

    @Column()
    rincian_kegiatan: string

    @Column()
    dokumentasi: string

            @Column({ type: 'enum', enum: ['acc' , 'proces' , 'rejected'], default: 'rejected' })
            proses: Proses

    @Column()
    kendala: string

    @Column()
    dokumentasi_lain: string

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

    @ManyToOne(() => User, (user) => user.logbook, {onDelete : 'CASCADE'})
    user: User

    @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.logbook, {onDelete : 'CASCADE'})
    pertemuan: Pertemuan
    
}
