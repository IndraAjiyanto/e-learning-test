import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Header } from "./header.entity";
import { Tentang } from "./tentang.entity";

@Entity()
export class Translation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    locale: string;

        @OneToOne(() => Tentang, (tentang) => tentang.translation,{
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
      })
      @JoinColumn()
        tentang: Tentang;

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;
}