import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Minggu } from "./minggu.entity";

@Entity()
export class ProgresMinggu{
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: false })
    quiz: boolean

                        @ManyToOne(() => User, (user) => user.progres_minggu, {onDelete : 'CASCADE'})
                        user: User

                            @ManyToOne(() => Minggu, (minggu) => minggu.progres_minggu, {onDelete : 'CASCADE'})
                            minggu: Minggu
}