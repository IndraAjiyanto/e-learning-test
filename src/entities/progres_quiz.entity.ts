import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Quiz } from "./quiz.entity";

@Entity()
export class ProgresQuiz{
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: false })
    proses: boolean

                        @ManyToOne(() => User, (user) => user.progres_quiz, {onDelete : 'CASCADE'})
                        user: User

                        @ManyToOne(() => Quiz, (quiz) => quiz.progres_quiz, {onDelete : 'CASCADE'})
                        quiz: Quiz

                                        @CreateDateColumn()
                                        createdAt: Date;
                                        
                                        @UpdateDateColumn()
                                        updatedAt: Date;

}