import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Team{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    profile: string
    
    @Column()
    nama: string

    @Column()
    posisi: string

    @Column()
    linkedin: string

                        @CreateDateColumn()
                        createdAt: Date;
                        
                        @UpdateDateColumn()
                        updatedAt: Date;
}