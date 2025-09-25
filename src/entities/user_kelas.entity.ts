import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class UserKelas{
    @PrimaryGeneratedColumn()
    id: number

    @Column({default: false})
    progres: boolean

      @ManyToOne(() => User, user => user.user_kelas, {onDelete : 'CASCADE'})  
      user: User;

              @ManyToOne(() => Kelas, (kelas) => kelas.user_kelas, {onDelete : 'CASCADE'})
              kelas: Kelas
}