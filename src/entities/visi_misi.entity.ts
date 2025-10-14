import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class VisiMisi{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    visi: string

    @Column()
    misi: string

                            @CreateDateColumn()
                            createdAt: Date;
                            
                            @UpdateDateColumn()
                            updatedAt: Date;
}