import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class BiodataMentor{
        @PrimaryGeneratedColumn()
        id: number

        @Column()
        role: string

            @OneToOne(() => User, (user) => user.biodata_mentor)
            @JoinColumn({ name: 'userId' })
            user: User
                    @CreateDateColumn()
                    createdAt: Date;
                    
                    @UpdateDateColumn()
                    updatedAt: Date;
}