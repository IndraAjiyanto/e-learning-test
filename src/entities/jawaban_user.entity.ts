import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pertanyaan } from "./pertanyaan.entity";
import { User } from "./user.entity";
import { Jawaban } from "./jawaban.entity";

@Entity()
export class JawabanUser{
    @PrimaryGeneratedColumn()
    id: number

                                  @ManyToOne(() => Pertanyaan, (pertanyaan) => pertanyaan.jawaban_user, {onDelete : 'CASCADE'})
                                  pertanyaan: Pertanyaan
                                  @ManyToOne(() => Jawaban, (jawaban) => jawaban.jawaban_user, {onDelete : 'CASCADE'})
                                  jawaban: Jawaban
    
                                  @ManyToOne(() => User, (user) => user.jawaban_user, {onDelete : 'CASCADE'})
                                  user: User
}
