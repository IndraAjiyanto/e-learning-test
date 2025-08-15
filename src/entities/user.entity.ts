import { BeforeInsert, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, BeforeUpdate } from 'typeorm';
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

@OneToMany(() => Absen, (absen) => absen.user, { cascade: true })
  absen: Absen[];

@ManyToMany(() => Kelas, (kelas) => kelas.user)
@JoinTable()
kelas: Kelas[];

}
