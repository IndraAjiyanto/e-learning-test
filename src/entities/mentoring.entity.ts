import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Kelas } from "./kelas.entity";

@Entity()
export class Mentoring {
    @PrimaryGeneratedColumn()
    id: number

          @ManyToOne(() => User, user => user.mentoring, {onDelete : 'CASCADE'})  
          user: User;
    
                  @ManyToOne(() => Kelas, (kelas) => kelas.mentoring, {onDelete : 'CASCADE'})
                  kelas: Kelas

               @CreateDateColumn()
                createdAt: Date;
                
                @UpdateDateColumn()
                updatedAt: Date;

}