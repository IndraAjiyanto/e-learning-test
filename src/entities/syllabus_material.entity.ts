import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Syllabus } from './syllabus.entity';
import { FileType } from './materials.entity';

/** Materi milik satu silabus. Enum jenis berkasnya dipakai ulang dari
 *  `Material` - itu kosakata bersama, bukan tabel bersama. */
@Entity('syllabus_material')
@Index('IDX_syllabus_material_syllabus', ['syllabus'])
export class SyllabusMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  file: string;

  @Column({
    name: 'fileType',
    type: 'enum',
    enum: ['video', 'pdf', 'ppt'],
    // Tipe enum dipakai ulang dari Material; tanpa ini TypeORM membuat
    // `syllabus_material_filetype_enum` sendiri dan skemanya melenceng.
    enumName: 'material_filetype_enum',
  })
  fileType: FileType;

  @ManyToOne(() => Syllabus, (s) => s.materials, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Exclude()
  syllabus: Syllabus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
