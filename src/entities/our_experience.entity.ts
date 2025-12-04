import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class OurExperience {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    icon: string;

    @Column('jsonb',{nullable: true})
    title: string[];

    @Column('jsonb',{nullable: true})
    description: string[];

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;
 
}