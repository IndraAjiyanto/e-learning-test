import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Team } from "./team.entity";
import { Story } from "./story.entity";
import { TeamLead } from "./team_lead.entity";
import { PertanyaanUmum } from "./pertanyaan_umum.entity";
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
        
        @OneToOne(() => Story, (story) => story.translation,{
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
      })
      @JoinColumn()
        story: Story;
        
        @OneToOne(() => TeamLead, (team_lead) => team_lead.translation,{
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
      })
      @JoinColumn()
        team_lead: TeamLead;

                @OneToOne(() => Visi, (visi) => visi.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          visi: Visi;

                @OneToOne(() => Value, (value) => value.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          value: Value;

                @OneToOne(() => Superiority, (superiority) => superiority.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          superiority: Superiority;

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