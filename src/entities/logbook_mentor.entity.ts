import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Pertemuan } from "./pertemuan.entity";

@Entity()
export class LogbookMentor{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    kegiatan: string

        @Column()
    rincian_kegiatan: string

    @Column()
    dokumentasi: string

        @Column()
        kendala: string
    
            @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;


                @ManyToOne(() => User, (user) => user.logbook_mentor, {onDelete : 'CASCADE'})
                user: User
            
                @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.logbook_mentor, {onDelete : 'CASCADE'})
                pertemuan: Pertemuan
}