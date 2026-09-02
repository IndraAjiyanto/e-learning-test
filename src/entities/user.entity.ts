import {
  BeforeInsert,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Absen } from './absen.entity';
import { Biodata } from './biodata.entity';
import { Portfolio } from './portfolio.entity';
import { Pembayaran } from './pembayaran.entity';
import { JawabanUser } from './jawaban_user.entity';
import { BiodataMentor } from './biodata_mentor.entity';
import { JawabanTugas } from './jawaban_tugas.entity';
import { Logbook } from './logbook.entity';
import { Nilai } from './nilai.entity';
import { ProgresMinggu } from './progres_minggu.entity';
import { ProgresPertemuan } from './progres_pertemuan.entity';
import { Sertifikat } from './sertifikat.entity';
import { UserKelas } from './user_kelas.entity';
import { LogbookMentor } from './logbook_mentor.entity';
import { ProgresQuiz } from './progres_quiz.entity';
import { Mentoring } from './mentoring.entity';
import { Pendaftaran } from './pendaftaran.entity';
import { Exclude } from 'class-transformer';
import { Likes } from './likes.entity';
import { Coment } from './coment.entity';

export type UserRole = 'super_admin' | 'admin' | 'user';

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

  @Column({ type: 'varchar', nullable: true })
  profile: string | null;

  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'user'],
    default: 'user',
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({ default: false, nullable: true })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verifikasiToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifikasiTokenExpires: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  countdownQuiz: Date | null;

  @Column({ default: false, nullable: true })
  quizStart: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @OneToMany(() => Absen, (absen) => absen.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  absen: Absen[];

  @OneToMany(() => Likes, (likes) => likes.user)
  @Exclude()
  likes: Likes[];

  @OneToMany(() => Coment, (coment) => coment.user)
  @Exclude()
  coment: Coment[];

  @OneToMany(() => Logbook, (logbook) => logbook.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  logbook: Logbook[];

  @OneToMany(() => LogbookMentor, (logbook_mentor) => logbook_mentor.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  logbook_mentor: LogbookMentor[];

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  portfolio: Portfolio[];

  @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  pembayaran: Pembayaran[];

  @OneToMany(() => JawabanUser, (jawaban_user) => jawaban_user.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  jawaban_user: JawabanUser[];

  @OneToMany(() => JawabanTugas, (jawaban_tugas) => jawaban_tugas.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  jawaban_tugas: JawabanTugas[];

  @OneToMany(() => UserKelas, (user_kelas) => user_kelas.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  user_kelas: UserKelas[];

  @OneToMany(() => Nilai, (nilai) => nilai.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  nilai: Nilai[];

  @OneToMany(() => ProgresMinggu, (progres_minggu) => progres_minggu.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  progres_minggu: ProgresMinggu[];

  @OneToMany(
    () => ProgresPertemuan,
    (progres_pertemuan) => progres_pertemuan.user,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @Exclude()
  progres_pertemuan: ProgresPertemuan[];

  @OneToMany(() => ProgresQuiz, (progres_quiz) => progres_quiz.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  progres_quiz: ProgresQuiz[];

  @OneToMany(() => Sertifikat, (sertifikat) => sertifikat.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  sertifikat: Sertifikat[];

  @OneToMany(() => Mentoring, (mentoring) => mentoring.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  mentoring: Mentoring[];

  @OneToMany(() => Pendaftaran, (pendaftaran) => pendaftaran.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  pendaftaran: Pendaftaran[];

  @OneToOne(() => Biodata, (biodata) => biodata.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  biodata: Biodata;

  @OneToOne(() => BiodataMentor, (biodata_mentor) => biodata_mentor.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  biodata_mentor: BiodataMentor;
}
