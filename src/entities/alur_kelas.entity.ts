import { IsString } from "class-validator";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kategori } from "./kategori.entity";

@Entity()
export class AlurKelas{
    @PrimaryGeneratedColumn()
    id: number

    @IsString()
    alur_ke: number

    @IsString()
    judul: string

    @IsString()
    isi: string

                        @CreateDateColumn()
                        createdAt: Date;
                        
                        @UpdateDateColumn()
                        updatedAt: Date;
    
        @ManyToOne(() => Kategori, (kategori) => kategori.alur_kelas, {onDelete : 'CASCADE'})
                        kategori: Kategori
}