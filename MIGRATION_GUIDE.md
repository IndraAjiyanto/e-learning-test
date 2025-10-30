# TypeORM Migration Guide

Panduan lengkap untuk mengupdate database schema tanpa menghapus data.

## 📋 Langkah-langkah Migration

### 1. **Ubah Entity Anda**

Misalnya tambahkan kolom baru di `mentor.entity.ts`:

```typescript
@Column({ nullable: true })
new_column: string;
```

### 2. **Generate Migration File**

Setelah mengubah entity, jalankan command berikut untuk generate migration file otomatis:

```bash
npm run migration:generate ./src/database/migrations/NamaPerubahan
```

**Contoh:**

```bash
npm run migration:generate ./src/database/migrations/AddNewColumnToMentor
```

TypeORM akan:

- Membandingkan entity dengan schema database
- Generate file migration dengan perubahan yang dibutuhkan
- File akan dibuat di: `src/database/migrations/[timestamp]-AddNewColumnToMentor.ts`

### 3. **Review Migration File**

Buka file migration yang baru dibuat dan pastikan SQL query sudah benar:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToMentor1730123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Query untuk menambahkan kolom baru
    await queryRunner.query(
      `ALTER TABLE "mentor" ADD "new_column" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Query untuk rollback (menghapus kolom)
    await queryRunner.query(`ALTER TABLE "mentor" DROP COLUMN "new_column"`);
  }
}
```

### 4. **Jalankan Migration**

```bash
npm run migration:run
```

Perintah ini akan menjalankan semua migration yang belum dijalankan.

### 5. **Rollback Migration (jika perlu)**

Jika ada kesalahan, Anda bisa rollback migration terakhir:

```bash
npm run migration:revert
```

---

## 🎯 Command Reference

| Command                                                              | Deskripsi                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `npm run migration:generate ./src/database/migrations/NamaMigration` | Generate migration file otomatis berdasarkan perubahan entity |
| `npm run migration:create ./src/database/migrations/NamaMigration`   | Buat migration file kosong (manual)                           |
| `npm run migration:run`                                              | Jalankan semua migration yang pending                         |
| `npm run migration:revert`                                           | Rollback migration terakhir                                   |

---

## 💡 Tips & Best Practices

### 1. **Naming Convention**

Gunakan nama yang deskriptif untuk migration:

- ✅ `AddEmailToUser`
- ✅ `CreateProductTable`
- ✅ `AddIndexToOrderDate`
- ❌ `Migration1`
- ❌ `Update`

### 2. **Synchronize Setting**

Pastikan `synchronize: false` di `data-source.ts`:

```typescript
export const dataSourceOptions: DataSourceOptions = {
  // ...
  synchronize: false, // ⚠️ HARUS false untuk production
  // ...
};
```

> **Warning:** `synchronize: true` akan auto-update schema dan bisa menyebabkan data loss!

### 3. **Backup Database**

Selalu backup database sebelum menjalankan migration di production:

```bash
pg_dump -U username database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 4. **Test Migration**

Test migration di development dulu:

1. Jalankan migration: `npm run migration:run`
2. Test aplikasi
3. Rollback: `npm run migration:revert`
4. Jalankan lagi untuk memastikan

### 5. **Git Version Control**

Commit migration files ke git:

```bash
git add src/database/migrations/*
git commit -m "feat: add new column to mentor table"
```

---

## 📝 Contoh Kasus

### Menambahkan Kolom Baru

**1. Update Entity:**

```typescript
// src/entities/mentor.entity.ts
@Column({ nullable: true })
gelar: string;
```

**2. Generate Migration:**

```bash
npm run migration:generate ./src/database/migrations/AddGelarToMentor
```

**3. Jalankan Migration:**

```bash
npm run migration:run
```

### Mengubah Tipe Kolom

**1. Update Entity:**

```typescript
// Dari: @Column()
// Menjadi:
@Column({ type: 'text' })
deskripsi: string;
```

**2. Generate & Run:**

```bash
npm run migration:generate ./src/database/migrations/ChangeDeskripsiTypeToText
npm run migration:run
```

### Menambahkan Relasi Baru

**1. Update Entity:**

```typescript
@ManyToOne(() => Department)
department: Department;
```

**2. Generate & Run:**

```bash
npm run migration:generate ./src/database/migrations/AddDepartmentRelationToMentor
npm run migration:run
```

---

## 🔧 Troubleshooting

### Error: "Cannot find module"

```bash
npm run build
npm run migration:generate ./src/database/migrations/MigrationName
```

### Migration Table Not Found

Jalankan migration pertama kali akan otomatis membuat table `migrations`:

```bash
npm run migration:run
```

### Query Failed

Cek log error, biasanya:

- Kolom sudah ada
- Tipe data tidak kompatibel
- Constraint violation

Fix manual atau edit migration file, lalu rollback dan run ulang.

---

## ⚠️ Important Notes

1. **JANGAN** gunakan `synchronize: true` di production
2. **SELALU** review migration file sebelum run
3. **BACKUP** database sebelum migration di production
4. **TEST** migration di development dulu
5. **COMMIT** migration files ke version control

---

## 📚 Resources

- [TypeORM Migrations Docs](https://typeorm.io/migrations)
- [NestJS Database Migrations](https://docs.nestjs.com/recipes/sql-typeorm#migrations)
