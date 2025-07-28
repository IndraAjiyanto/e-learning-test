import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Pertemuan } from "./pertemuan.entity";

export enum Status {
    Hadir = 'hadir',
    Izin = 'izin',
    Sakit = 'sakit',
    Alfa = 'alfa',
    TidakAdaKeterangan = 'tidak ada keterangan'
}

@Entity()
export class Absen {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "set",
        enum: Status,
        default: [Status.TidakAdaKeterangan],
    })
    status: Status[]

    @Column()
    waktu_absen: Date

    @Column()
    Keterangan: string

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    
  @ManyToOne(() => User, user => user.absen)
  user: User;

  @ManyToOne(() => Pertemuan, pertemuan => pertemuan.absen)
  pertemuan: Pertemuan;
}
