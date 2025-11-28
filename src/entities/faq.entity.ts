import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Translation } from "./translation.entity";

@Entity()
export class Faq {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;
    @Column()
    answer: string;

    @OneToOne(() => Translation, (translation) => translation.faq)
    translation: Translation;

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}