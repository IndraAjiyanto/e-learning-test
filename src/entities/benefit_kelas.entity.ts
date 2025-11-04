import { IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class BenefitKelas{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    benefit: string

    @Column()
    isi: string

    @Column()
    icon: string

                    @CreateDateColumn()
                    createdAt: Date;
                    
                    @UpdateDateColumn()
                    updatedAt: Date;

    @ManyToOne(() => Kelas, (kelas) => kelas.benefit_kelas, {onDelete : 'CASCADE'})
                    kelas: Kelas
}