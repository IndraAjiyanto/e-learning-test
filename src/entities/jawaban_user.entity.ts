import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pertanyaan } from "./pertanyaan.entity";
import { User } from "./user.entity";

@Entity()
export class JawabanUser{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    jawaban: string

                                  @ManyToOne(() => Pertanyaan, (pertanyaan) => pertanyaan.jawaban_user)
                                  pertanyaan: Pertanyaan
    
                                  @ManyToOne(() => User, (user) => user.jawaban_user)
                                  user: User
}
