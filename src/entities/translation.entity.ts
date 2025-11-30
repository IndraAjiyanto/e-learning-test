import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Team } from "./team.entity";
import { TeamLead } from "./team_lead.entity";
import { Kategori } from "./kategori.entity";

@Entity()
export class Translation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    locale: string;

        
        @OneToOne(() => TeamLead, (team_lead) => team_lead.translation,{
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
      })
      @JoinColumn()
        team_lead: TeamLead;

                @OneToOne(() => Kategori, (kategori) => kategori.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          kategori: Kategori;

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;
}