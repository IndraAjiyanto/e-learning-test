import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pertanyaan } from "./pertanyaan.entity";
import { JawabanUser } from "./jawaban_user.entity";

@Entity()
export class Jawaban{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    jawaban: string

@Column({ default: false })
jawaban_benar: boolean;

        @CreateDateColumn()
        createdAt: Date;
        
        @UpdateDateColumn()
        updatedAt: Date;

                              @ManyToOne(() => Pertanyaan, (pertanyaan) => pertanyaan.jawaban, {onDelete : 'CASCADE'})
                              pertanyaan: Pertanyaan
                    @OneToMany(() => JawabanUser, (jawaban_user) => jawaban_user.jawaban, {cascade: true, onDelete : 'CASCADE'})
                    jawaban_user: JawabanUser[]
}