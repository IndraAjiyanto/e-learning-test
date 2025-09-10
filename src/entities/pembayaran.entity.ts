import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Kelas } from "./kelas.entity";

export type Proses = 'acc' | 'proces' | 'rejected';

@Entity()
export class Pembayaran{
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    file: string

    @Column({ type: 'enum', enum: ['acc' , 'proces' , 'rejected'], default: 'rejected' })
    proses: Proses

       @CreateDateColumn()
       createdAt: Date;
       
       @UpdateDateColumn()
       updatedAt: Date;

                    @ManyToOne(() => User, (user) => user.pembayaran, {onDelete : 'CASCADE'})
                    user: User
    
                    @ManyToOne(() => Kelas, (kelas) => kelas.pembayaran, {onDelete : 'CASCADE'})
                    kelas: Kelas
}