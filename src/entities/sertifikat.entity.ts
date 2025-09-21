import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Kelas } from "./kelas.entity";
import { User } from "./user.entity";

@Entity()
export class Sertifikat{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    sertif: string

                    @CreateDateColumn()
                    createdAt: Date;
                    
                    @UpdateDateColumn()
                    updatedAt: Date;

            @ManyToOne(() => Kelas, (kelas) => kelas.sertifikat, {onDelete : 'CASCADE'})
            kelas: Kelas
                                  @ManyToOne(() => User, (user) => user.sertifikat, {onDelete : 'CASCADE'})
                                  user: User
}