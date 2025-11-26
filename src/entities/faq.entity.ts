import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Faq {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;
    @Column()
    answer: string;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}