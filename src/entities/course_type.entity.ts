import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Category } from './category.entity';
import { Exclude } from 'class-transformer';

@Entity('course_type')
export class CourseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  nameClassesType: string;

  @Column()
  icon: string;

  // Kolom multibahasa, sejajar dengan Course.description — BUKAN array.
  // Tipe sebelumnya (`string[]`) tidak pernah cocok dengan isi tabel: form
  // create/edit selalu mengirim description[id]/[en]/[ja] dan baris yang ada
  // di database berbentuk objek. Kolomnya jsonb, jadi koreksi ini murni tipe
  // TypeScript dan tidak butuh migrasi.
  @Column('jsonb', { nullable: true })
  description: { id: string; en: string; ja: string };

  @OneToMany(() => Course, (course) => course.courseType)
  @Exclude()
  classes: Course[];

  @ManyToMany(() => Category, (category) => category.courseTypes)
  @Exclude()
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
