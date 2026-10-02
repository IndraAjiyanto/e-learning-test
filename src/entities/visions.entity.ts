import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('visions')
export class Vision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Kolom multibahasa, sejajar dengan Course.description — BUKAN array.
  // Tipe lama (`string[]`) tidak pernah cocok dengan isinya: form selalu
  // mengirim {field}[id]/[en]/[ja] dan baris di database berbentuk objek,
  // seperti yang juga diasumsikan view publik lewat helper getByLang.
  // Kolomnya jsonb, jadi koreksi ini murni tipe TypeScript, tanpa migrasi.
  @Column('jsonb', { nullable: true })
  visions: { id: string; en: string; ja: string };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
