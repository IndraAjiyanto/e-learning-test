import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Commitment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Kolom multibahasa, BUKAN array. Tipe lama (`string[]`) tidak pernah cocok
  // dengan isinya: form selalu mengirim {field}[id]/[en]/[ja] dan setiap baris
  // di database berbentuk objek. Kolomnya jsonb, jadi koreksi ini murni tipe
  // TypeScript dan tidak butuh migrasi.
  @Column('jsonb', { nullable: true })
  title: { id: string; en: string; ja: string };

  @Column('jsonb', { nullable: true })
  description: { id: string; en: string; ja: string };

  @Column()
  icon: string;

  @Column({ nullable: true })
  commitmentOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
