import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pertemuan } from "./pertemuan.entity";
import { Kelas } from "./kelas.entity";
import { Quiz } from "./quiz.entity";

@Entity()
export class Minggu {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    minggu_ke: number

    @Column()
    keterangan: string

      @Column({ default: false })
  check: boolean;

           @CreateDateColumn()
            createdAt: Date;
            
            @UpdateDateColumn()
            updatedAt: Date;
    
    @OneToMany(() => Pertemuan, (pertemuan) => pertemuan.minggu, {cascade: true, onDelete : 'CASCADE'})
    pertemuan: Pertemuan[]

    @OneToMany(() => Quiz, (quiz) => quiz.minggu, {cascade: true, onDelete : 'CASCADE'})
    quiz: Quiz[]

        @ManyToOne(() => Kelas, (kelas) => kelas.minggu, {onDelete : 'CASCADE'})
        kelas: Kelas

}