import { BeforeInsert, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, BeforeUpdate, OneToOne, JoinColumn } from 'typeorm';
import * as bcrypt from "bcrypt";
import { Absen } from './absen.entity';
import { Kelas } from './kelas.entity';
import { Biodata } from './biodata.entity';
import { Portfolio } from './portfolio.entity';
import { Pembayaran } from './pembayaran.entity';
import { JawabanUser } from './jawaban_user.entity';
import { BiodataMentor } from './biodata_mentor.entity';
import { JawabanTugas } from './jawaban_tugas.entity';
import { Logbook } from './logbook.entity';
import { Nilai } from './nilai.entity';

export type UserRole = 'super_admin' |'admin' | 'user';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  profile: string;

  @Column({ type: 'enum', enum: ['super_admin', 'admin', 'user'], default: 'user' })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword(){
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

@OneToMany(() => Absen, (absen) => absen.user, { cascade: true, onDelete: 'CASCADE' })
  absen: Absen[];

@OneToMany(() => Logbook, (logbook) => logbook.user, { cascade: true, onDelete: 'CASCADE' })
  logbook: Logbook[];

@OneToMany(() => Portfolio, (portfolio) => portfolio.user, { cascade: true, onDelete: 'CASCADE'  })
  portfolio: Portfolio[];

@OneToMany(() => Pembayaran, (pembayaran) => pembayaran.user, { cascade: true,  onDelete: 'CASCADE' })
  pembayaran: Pembayaran[];

@OneToMany(() => JawabanUser, (jawaban_user) => jawaban_user.user, { cascade: true, onDelete: 'CASCADE' })
  jawaban_user: JawabanUser[];

@OneToMany(() => JawabanTugas, (jawaban_tugas) => jawaban_tugas.user, { cascade: true, onDelete: 'CASCADE' })
  jawaban_tugas: JawabanTugas[];

@ManyToMany(() => Kelas, (kelas) => kelas.user, { cascade: true, onDelete: 'CASCADE' })
@JoinTable()
kelas: Kelas[];

@OneToMany(() => Nilai, (nilai) => nilai.user, { cascade: true, onDelete: 'CASCADE' })
nilai: Nilai[];

    @OneToOne(() => Biodata, (biodata) => biodata.user, { cascade: true, onDelete: 'CASCADE' }) 
    biodata: Biodata

    @OneToOne(() => BiodataMentor, (biodata_mentor) => biodata_mentor.user, { cascade: true, onDelete: 'CASCADE' }) 
    biodata_mentor: BiodataMentor
}
