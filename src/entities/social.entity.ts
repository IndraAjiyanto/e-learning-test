import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Social{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    linkedin: string

    @Column()
    instragram: string

    @Column()
    youtube: string

    @Column()
    email: string

    @Column()
    alamat: string

    @Column()
    nomor: string

}