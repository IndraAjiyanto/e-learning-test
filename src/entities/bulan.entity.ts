import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kelas } from "./kelas.entity";

@Entity()
export class Bulan{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    bulan: number

    
                @OneToMany(() => Kelas, (kelas) => kelas.bulan)
                kelas: Kelas[]

            @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;
}