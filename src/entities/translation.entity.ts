import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Header } from "./header.entity";
import { Tentang } from "./tentang.entity";
import { Alumni } from "./alumni.entity";
import { Team } from "./team.entity";
import { Story } from "./story.entity";
import { TeamLead } from "./team_lead.entity";
import { PertanyaanUmum } from "./pertanyaan_umum.entity";
import { Visi } from "./visi.entity";
import { Value } from "./value.entity";
import { Superiority } from "./superiority.entity";
import { Info } from "./info.entity";
import { PertanyaanKelas } from "./pertanyaan_kelas.entity";
import { Misi } from "./misi.entity";
import { Kategori } from "./kategori.entity";
import { JenisKelas } from "./jenis_kelas.entity";
import { FlowCategory } from "./flow_category.entity";
import { Experience } from "./experience.entity";
import { Commitment } from "./commitment.entity";

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
        
        @OneToOne(() => PertanyaanUmum, (pertanyaan_umum) => pertanyaan_umum.translation,{
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
      })
      @JoinColumn()
        pertanyaan_umum: PertanyaanUmum;
        


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

                @OneToOne(() => Info, (info) => info.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          info: Info;

                @OneToOne(() => PertanyaanKelas, (pertanyaan_kelas) => pertanyaan_kelas.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          pertanyaan_kelas: PertanyaanKelas;

                @OneToOne(() => Misi, (misi) => misi.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          misi: Misi;

                @OneToOne(() => Kategori, (kategori) => kategori.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          kategori: Kategori;

                @OneToOne(() => JenisKelas, (jenis_kelas) => jenis_kelas.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          jenis_kelas: JenisKelas;

                @OneToOne(() => FlowCategory, (flow_category) => flow_category.translation,{
          cascade: true,
          nullable: true,
          onDelete: 'CASCADE',
        })
        @JoinColumn()
          flow_category: FlowCategory;

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;
}