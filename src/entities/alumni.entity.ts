import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kelas } from "./kelas.entity";

@Entity()
export class Alumni {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    profile: string

    @Column()
    nama: string

    @Column()
    pesan: string

    @Column()
    alumni: string

    @Column()
    posisi_sekarang: string

    @Column()
    kelas: string

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

}