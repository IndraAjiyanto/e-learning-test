import { IsString } from "class-validator";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";

@Entity()
export class BenefitKelas{
    @PrimaryGeneratedColumn()
    id: number

    @IsString()
    benefit: string

    @IsString()
    isi: string

    @IsString()
    icon: string

                    @CreateDateColumn()
                    createdAt: Date;
                    
                    @UpdateDateColumn()
                    updatedAt: Date;

    @ManyToOne(() => Kategori, (kategori) => kategori.benefit_kelas, {onDelete : 'CASCADE'})
                    kategori: Kategori
}