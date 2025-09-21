import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class Portfolio{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    gambar: string

    @Column()
    judul: string

    @Column()
    deskripsi: string

      @Column("jsonb")
  teknologi: string[];


            @CreateDateColumn()
            createdAt: Date;
                
            @UpdateDateColumn()
            updatedAt: Date;

                @ManyToOne(() => User, (user) => user.portfolio, {onDelete : 'CASCADE'})
                user: User

                @ManyToOne(() => Kelas, (kelas) => kelas.portfolio, {onDelete : 'CASCADE'})
                kelas: Kelas

}