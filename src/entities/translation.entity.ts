import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Team } from "./team.entity";
import { TeamLead } from "./team_lead.entity";
import { Visi } from "./visi.entity";
import { Value } from "./value.entity";
import { Superiority } from "./superiority.entity";
import { Kategori } from "./kategori.entity";

@Entity()
export class Translation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    locale: string;

        @OneToOne(() => Team, (team) => team.translation,{
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
      })
      @JoinColumn()
        team: Team;
        
        @OneToOne(() => TeamLead, (team_lead) => team_lead.translation,{
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
      })
      @JoinColumn()
        team_lead: TeamLead;

                @OneToOne(() => Value, (value) => value.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          value: Value;

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