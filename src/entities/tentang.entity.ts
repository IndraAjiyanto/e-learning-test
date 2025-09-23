import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Tentang{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    judul: string

    @Column()
    text: string

    @Column()
    gambar: string

                    @CreateDateColumn()
                    createdAt: Date;
                    
                    @UpdateDateColumn()
                    updatedAt: Date;
}