import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Kelas } from "./kelas.entity";

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

    @Column()
    kendala: string

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

    @ManyToOne(() => User, (user) => user.logbook, {onDelete : 'CASCADE'})
    user: User

    @ManyToOne(() => Kelas, (kelas) => kelas.logbook, {onDelete : 'CASCADE'})
    kelas: Kelas
    
}
