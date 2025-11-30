import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Faq {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb', { nullable: true })
    question: string[];

    @Column('jsonb', { nullable: true })
    answer: string[];

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}