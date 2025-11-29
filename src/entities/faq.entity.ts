import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Translation } from "./translation.entity";

@Entity()
export class Faq {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb')
    question: string[];

    @Column('jsonb')
    answer: string[];

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}