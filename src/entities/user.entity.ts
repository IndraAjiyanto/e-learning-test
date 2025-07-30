import { BeforeInsert, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import * as bcrypt from "bcrypt";
import { Absen } from './absen.entity';
import { Kelas } from './kelas.entity';

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

  @Column({ type: 'enum', enum: ['super_admin', 'admin', 'user'], default: 'user' })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword(){
    this.password = await bcrypt.hash(this.password, 10);
  }

@OneToMany(() => Absen, (absen) => absen.user)
  absen: Absen[];

    @ManyToMany(() => Kelas)
    @JoinTable()
    kelas: Kelas[]
}
