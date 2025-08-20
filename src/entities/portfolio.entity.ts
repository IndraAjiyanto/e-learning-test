import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class Portfolio{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    sertif: string

            @CreateDateColumn()
            createdAt: Date;
                
            @UpdateDateColumn()
            updatedAt: Date;

                @ManyToOne(() => User, (user) => user.portfolio)
                user: User

                @ManyToOne(() => Kelas, (kelas) => kelas.portfolio)
                kelas: Kelas


}