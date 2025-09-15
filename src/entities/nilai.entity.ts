import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Quiz } from "./quiz.entity";

@Entity()
export class Nilai {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nilai: number

            @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;

    @ManyToOne(() => User, (user) => user.nilai, {onDelete : 'CASCADE'})
    user: User

    @ManyToOne(() => Quiz, (quiz) => quiz.nilai, {onDelete : 'CASCADE'})
    quiz: Quiz

}