import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { CourseType } from './course_type.entity';
import { CategoryFaq } from './faqs.entity';
import { BenefitCategory } from './benefit_category.entity';
import { Exclude } from 'class-transformer';
import { Gallery } from './gallery.entity';

export type Type = 'Special Program' | 'Paid Program' | 'Free Program';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  // Nama kategori per bahasa: `name` tetap Indonesia. Dua kolom ini nullable
  // karena baris di server sudah ada sebelum kolomnya ditambahkan (tanpa
  // migration) — semua pembacaan harus tahan NULL dan jatuh ke `name`.
  // `type` eksplisit wajib: tipe TS `string | null` direfleksikan TypeORM jadi
  // `Object` lewat emitDecoratorMetadata, sehingga tanpa ini metadata invalid
  // (DataTypeNotSupportedError: Data type "Object" in "Category.name_en").
  @Column({ type: 'varchar', nullable: true })
  name_en: string | null;

  @Column({ type: 'varchar', nullable: true })
  name_ja: string | null;

  @Column('jsonb', { nullable: true })
  text: string[];

  @Column()
  icon: string;

  @Column({ nullable: true })
  hero_section_image: string;

  @Column('jsonb', { nullable: true })
  description: string[];

  @Column({ nullable: true })
  contact: string;

  @Column({
    type: 'enum',
    enum: ['Special Program', 'Paid Program', 'Free Program'],
    nullable: true,
  })
  type: Type;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Course, (course) => course.category)
  @Exclude()
  courses: Course[];

  @OneToMany(() => CategoryFaq, (faq) => faq.category)
  @Exclude()
  faqs: CategoryFaq[];

  @OneToMany(
    () => BenefitCategory,
    (benefit_category) => benefit_category.category,
  )
  @Exclude()
  benefit_category: BenefitCategory[];

  @ManyToMany(() => CourseType, (courseType) => courseType.categories)
  @JoinTable({ name: 'category_course_types' })
  @Exclude()
  courseTypes: CourseType[];

  @OneToMany(() => Gallery, (gallery) => gallery.category)
  @Exclude()
  gallery: Gallery[];
}

