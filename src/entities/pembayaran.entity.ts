import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class Pembayaran{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    file: string

       @CreateDateColumn()
       createdAt: Date;
       
       @UpdateDateColumn()
       updatedAt: Date;

                    @ManyToOne(() => User, (user) => user.pembayaran)
                    user: User
    
                    @ManyToOne(() => Kelas, (kelas) => kelas.pembayaran)
                    kelas: Kelas
}