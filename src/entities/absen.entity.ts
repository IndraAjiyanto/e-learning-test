import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Pertemuan } from "./pertemuan.entity";

export type Status = 'izin' | 'hadir' | 'sakit' | 'alfa' | 'tidak ada keterangan';

@Entity()
export class Absen {
    @PrimaryGeneratedColumn()
    id: number

  @Column({ type: 'enum', enum: ['izin', 'hadir', 'sakit', 'alfa', 'tidak ada keterangan'], default: 'tidak ada keterangan' })
  status: Status;

    @Column()
    waktu_absen: Date

    @Column()
    keterangan: string

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    
  @ManyToOne(() => User, user => user.absen)
  user: User;

  @ManyToOne(() => Pertemuan, pertemuan => pertemuan.absen)
  pertemuan: Pertemuan;
}
