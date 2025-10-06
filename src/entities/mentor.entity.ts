import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kelas } from "./kelas.entity";

@Entity()
export class Mentor{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nama: string

    @Column()
    posisi: string

    @Column()
    linkedin: string

    @Column()
    github: string

    @Column("jsonb")
    teknologi: string[]

    @Column()
    profile: string

    @Column()
    deskripsi: string

               @CreateDateColumn()
                createdAt: Date;
                
                @UpdateDateColumn()
                updatedAt: Date;

        @ManyToOne(() => Kelas, (kelas) => kelas.mentor, {onDelete : 'CASCADE'})
        kelas: Kelas
}