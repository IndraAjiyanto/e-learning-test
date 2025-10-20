import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Pertemuan } from "./pertemuan.entity";

@Entity()
export class ProgresPertemuan{
    @PrimaryGeneratedColumn()
    id: number

    @Column({default: false})
    tugas: boolean

    @Column({default: false})
    materi: boolean

    @ManyToOne(() => User, (user) => user.progres_pertemuan, {onDelete : 'CASCADE'})
    user: User

    @ManyToOne(() => Pertemuan, (pertemuan) => pertemuan.progres_pertemuan, {onDelete : 'CASCADE'})
    pertemuan: Pertemuan

                    @CreateDateColumn()
                    createdAt: Date;
                    
                    @UpdateDateColumn()
                    updatedAt: Date;
    
}