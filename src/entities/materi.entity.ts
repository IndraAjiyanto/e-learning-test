import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Kelas } from "./kelas.entity";

@Entity()
export class Materi {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    pdf: string;

    @Column({ nullable: true })
    video: string;

    @Column({ nullable: true })
    ppt: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Kelas, (kelas) => kelas.materi)
    kelas: Kelas
}
