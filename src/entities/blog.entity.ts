import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Blog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    judul: string;

    @Column()
    isi: string;

    @Column()
    gambar: string;

            @CreateDateColumn()
            createdAt: Date;
                
            @UpdateDateColumn()
            updatedAt: Date;
}