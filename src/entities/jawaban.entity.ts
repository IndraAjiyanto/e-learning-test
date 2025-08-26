import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pertanyaan } from "./pertanyaan.entity";
import { User } from "./user.entity";

@Entity()
export class Jawaban{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    jawaban_user: string

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

                              @ManyToOne(() => Pertanyaan, (pertanyaan) => pertanyaan.jawaban)
                              pertanyaan: Pertanyaan

                              @ManyToOne(() => User, (user) => user.jawaban)
                              user: User
}