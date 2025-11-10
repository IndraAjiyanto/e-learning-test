import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class VisiMisi{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    visi: string

@Column({ type: 'text' })
misi: string


    @Column()
    icon: string

                            @CreateDateColumn()
                            createdAt: Date;
                            
                            @UpdateDateColumn()
                            updatedAt: Date;
}