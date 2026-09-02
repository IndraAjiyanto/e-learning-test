import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Mengubah seluruh primary key integer (`@PrimaryGeneratedColumn()`) menjadi
 * UUID, berikut semua foreign key yang mereferensikannya.
 *
 * PRINSIP
 * -------
 * 1. TIDAK ADA `DROP TABLE`, `TRUNCATE`, atau `DELETE`. Hanya kolom yang
 *    ditambah / diganti tipe. Seluruh baris dipertahankan.
 *
 * 2. UUID diturunkan secara DETERMINISTIK dari (nama tabel, id lama) memakai
 *    `uuid_generate_v5(NAMESPACE, 'tabel:id')`. Konsekuensinya:
 *      - id 7 di `course` SELALU menghasilkan UUID yang sama, di mesin mana pun.
 *      - Foreign key tidak perlu di-JOIN ke tabel induk: nilai UUID anak
 *        dihitung dari (tabel_induk, nilai_int_lama) sehingga PASTI cocok
 *        dengan UUID induknya. Ini menghilangkan seluruh kelas bug
 *        "child menunjuk parent yang salah".
 *
 * 3. Nilai integer lama TIDAK dibuang. Setiap tabel mendapat kolom
 *    `legacy_id integer`. Gunanya dua:
 *      - `down()` bisa memulihkan integer PERSIS seperti semula (lossless).
 *      - referensi eksternal lama (URL, invoice, email, spreadsheet) yang
 *        terlanjur menyimpan ID numerik masih bisa dicari.
 *
 * 4. Seluruh metadata asli (nama constraint PK/FK, ON DELETE/UPDATE, NOT NULL,
 *    definisi index) di-snapshot ke tabel `_uuid_migration_meta` SEBELUM apa pun
 *    diubah, lalu dipakai untuk membangun ulang constraint dengan NAMA YANG SAMA.
 *    Tabel snapshot ini sengaja ditinggal setelah `up()` supaya `down()`
 *    punya sumber kebenaran; ia dihapus di akhir `down()`.
 *
 * DIKECUALIKAN
 * ------------
 * - `migrations`   : tabel internal TypeORM.
 * - `web_sessions` : session store connect-pg-simple, PK-nya `sid varchar`.
 *
 * PRASYARAT
 * ---------
 * Extension `uuid-ossp` (untuk `uuid_generate_v5`). Migrasi membuatnya sendiri
 * lewat `CREATE EXTENSION IF NOT EXISTS`, yang butuh hak superuser ATAU
 * extension sudah terpasang lebih dulu oleh DBA. Kalau role aplikasi bukan
 * superuser, jalankan sekali sebagai superuser sebelum migrate:
 *   psql -d <db> -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'
 *
 * BACKUP DULU:
 *   pg_dump -h <host> -U <user> -d <db> -Fc -f pre-uuid.dump
 */
export class ConvertIdsToUuid1788300000000 implements MigrationInterface {
  name = 'ConvertIdsToUuid1788300000000';

  /**
   * Namespace tetap untuk uuid_generate_v5. JANGAN PERNAH diubah setelah
   * migrasi dijalankan di environment mana pun — mengubahnya berarti
   * seluruh UUID yang dihasilkan berbeda.
   */
  private static readonly NS = 'b1f4e1a2-3c5d-4e6f-8a9b-0c1d2e3f4a5b';

  private static readonly EXCLUDED = ['migrations', 'web_sessions'];

  public async up(q: QueryRunner): Promise<void> {
    const NS = ConvertIdsToUuid1788300000000.NS;
    const excluded = ConvertIdsToUuid1788300000000.EXCLUDED.map(
      (t) => `'${t}'`,
    ).join(', ');

    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ==================================================================
    // TAHAP 0  Snapshot metadata asli.
    //          Semua tahap berikutnya membaca dari sini, bukan dari
    //          pg_catalog yang sedang kita ubah.
    // ==================================================================
    await q.query(`
      CREATE TABLE IF NOT EXISTS "_uuid_migration_meta" (
        "kind"        text NOT NULL,
        "table_name"  text NOT NULL,
        "object_name" text NOT NULL,
        "payload"     jsonb NOT NULL
      )
    `);
    await q.query(`DELETE FROM "_uuid_migration_meta"`);

    // --- 0a. Tabel target: base table dengan PK tunggal bernama "id" bertipe integer.
    await q.query(`
      INSERT INTO "_uuid_migration_meta" (kind, table_name, object_name, payload)
      SELECT 'target_table', c.relname, con.conname, '{}'::jsonb
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = con.conkey[1]
      WHERE con.contype = 'p'
        AND c.relkind = 'r'
        AND array_length(con.conkey, 1) = 1
        AND a.attname = 'id'
        AND a.atttypid = 'int4'::regtype
        AND c.relname NOT IN (${excluded})
    `);

    // --- 0b. Primary key komposit (join table many-to-many) — PK-nya harus
    //         dibongkar-pasang juga karena kolom penyusunnya adalah FK
    //         yang berubah tipe.
    await q.query(`
      INSERT INTO "_uuid_migration_meta" (kind, table_name, object_name, payload)
      SELECT 'composite_pk', c.relname, con.conname,
             jsonb_build_object('cols', (
               SELECT jsonb_agg(a.attname ORDER BY k.ord)
               FROM unnest(con.conkey) WITH ORDINALITY k(attnum, ord)
               JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum
             ))
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
      WHERE con.contype = 'p'
        AND array_length(con.conkey, 1) > 1
        AND c.relname NOT IN (${excluded})
    `);

    // --- 0c. Foreign key yang menunjuk ke salah satu tabel target.
    await q.query(`
      INSERT INTO "_uuid_migration_meta" (kind, table_name, object_name, payload)
      SELECT 'fk', src.relname, con.conname,
             jsonb_build_object(
               'column',     ca.attname,
               'parent',     tgt.relname,
               'parent_col', pa.attname,
               'notnull',    ca.attnotnull,
               'on_delete',  con.confdeltype,
               'on_update',  con.confupdtype
             )
      FROM pg_constraint con
      JOIN pg_class src ON src.oid = con.conrelid
      JOIN pg_class tgt ON tgt.oid = con.confrelid
      JOIN pg_namespace n ON n.oid = src.relnamespace AND n.nspname = 'public'
      JOIN pg_attribute ca ON ca.attrelid = src.oid AND ca.attnum = con.conkey[1]
      JOIN pg_attribute pa ON pa.attrelid = tgt.oid AND pa.attnum = con.confkey[1]
      WHERE con.contype = 'f'
        AND array_length(con.conkey, 1) = 1
        AND ca.atttypid = 'int4'::regtype
        AND pa.attname = 'id'
        AND tgt.relname IN (
          SELECT table_name FROM "_uuid_migration_meta" WHERE kind = 'target_table'
        )
    `);

    // --- 0d. Index non-PK yang menyentuh kolom FK di atas. Kolom yang di-DROP
    //         membawa serta index-nya, jadi definisinya harus disimpan.
    await q.query(`
      INSERT INTO "_uuid_migration_meta" (kind, table_name, object_name, payload)
      SELECT DISTINCT 'index', t.relname, i.relname,
             jsonb_build_object('def', pg_get_indexdef(i.oid))
      FROM pg_index ix
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (ix.indkey)
      WHERE NOT ix.indisprimary
        AND NOT EXISTS (
          SELECT 1 FROM pg_constraint con
          WHERE con.conindid = i.oid AND con.contype IN ('p', 'u', 'x')
        )
        AND EXISTS (
          SELECT 1 FROM "_uuid_migration_meta" m
          WHERE m.kind = 'fk' AND m.table_name = t.relname
            AND m.payload ->> 'column' = a.attname
        )
    `);

    // --- 0e. Unique CONSTRAINT (bukan sekadar index) di kolom FK, kalau ada.
    await q.query(`
      INSERT INTO "_uuid_migration_meta" (kind, table_name, object_name, payload)
      SELECT DISTINCT 'unique_constraint', t.relname, con.conname,
             jsonb_build_object('def', pg_get_constraintdef(con.oid))
      FROM pg_constraint con
      JOIN pg_class t ON t.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (con.conkey)
      WHERE con.contype = 'u'
        AND EXISTS (
          SELECT 1 FROM "_uuid_migration_meta" m
          WHERE m.kind = 'fk' AND m.table_name = t.relname
            AND m.payload ->> 'column' = a.attname
        )
    `);

    const targets: TargetMeta[] = await q.query(TARGET_SELECT);
    const fks: FkMeta[] = await q.query(FK_SELECT);
    const compositePks: CompositePkMeta[] = await q.query(COMPOSITE_PK_SELECT);
    const indexes: { def: string }[] = await q.query(INDEX_SELECT);
    const uniqueCons: UniqueMeta[] = await q.query(UNIQUE_SELECT);

    if (targets.length === 0) {
      throw new Error(
        'ConvertIdsToUuid: tidak menemukan satu pun tabel dengan primary key ' +
          'integer bernama "id". Migrasi dibatalkan agar tidak mengubah apa pun.',
      );
    }

    // ==================================================================
    // TAHAP 1  Tambah kolom baru. Belum ada yang dihapus — sampai titik ini
    //          database masih 100% berfungsi seperti sebelumnya.
    // ==================================================================
    for (const t of targets) {
      await q.query(
        `ALTER TABLE "${t.table_name}" ADD COLUMN "legacy_id" integer`,
      );
      await q.query(`UPDATE "${t.table_name}" SET "legacy_id" = "id"`);
      await q.query(`ALTER TABLE "${t.table_name}" ADD COLUMN "id__uuid" uuid`);
      await q.query(
        `UPDATE "${t.table_name}"
         SET "id__uuid" = uuid_generate_v5('${NS}'::uuid, '${t.table_name}:' || "id")`,
      );
      await q.query(
        `ALTER TABLE "${t.table_name}" ALTER COLUMN "id__uuid" SET NOT NULL`,
      );
    }

    // Kolom FK: UUID dihitung dari (tabel induk, nilai int lama) memakai rumus
    // yang sama persis dengan TAHAP 1, sehingga dijamin cocok tanpa JOIN.
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}" ADD COLUMN "${fk.column}__uuid" uuid`,
      );
      await q.query(
        `UPDATE "${fk.table_name}"
         SET "${fk.column}__uuid" =
             uuid_generate_v5('${NS}'::uuid, '${fk.parent}:' || "${fk.column}")
         WHERE "${fk.column}" IS NOT NULL`,
      );
    }

    // ==================================================================
    // TAHAP 2  Verifikasi SEBELUM merusak apa pun. Kalau ada satu saja anak
    //          yang tidak menemukan induknya, transaksi migrasi TypeORM
    //          di-rollback dan database tetap utuh.
    // ==================================================================
    for (const fk of fks) {
      const [orphan] = await q.query(
        `SELECT count(*)::int AS n
         FROM "${fk.table_name}" c
         LEFT JOIN "${fk.parent}" p ON p."id__uuid" = c."${fk.column}__uuid"
         WHERE c."${fk.column}" IS NOT NULL AND p."id__uuid" IS NULL`,
      );
      if (orphan.n > 0) {
        throw new Error(
          `ConvertIdsToUuid: ${orphan.n} baris di "${fk.table_name}"."${fk.column}" ` +
            `tidak menemukan induk di "${fk.parent}" setelah pemetaan UUID ` +
            `(constraint ${fk.object_name}). Migrasi dibatalkan.`,
        );
      }
    }
    for (const t of targets) {
      const [dup] = await q.query(
        `SELECT count(*)::int AS n FROM (
           SELECT "id__uuid" FROM "${t.table_name}"
           GROUP BY "id__uuid" HAVING count(*) > 1
         ) d`,
      );
      if (dup.n > 0) {
        throw new Error(
          `ConvertIdsToUuid: ${dup.n} UUID duplikat di "${t.table_name}". Migrasi dibatalkan.`,
        );
      }
    }

    // ==================================================================
    // TAHAP 3  Lepas constraint lama (urutan: FK dulu, baru PK).
    // ==================================================================
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.object_name}"`,
      );
    }
    for (const u of uniqueCons) {
      await q.query(
        `ALTER TABLE "${u.table_name}" DROP CONSTRAINT "${u.object_name}"`,
      );
    }
    for (const pk of compositePks) {
      await q.query(
        `ALTER TABLE "${pk.table_name}" DROP CONSTRAINT "${pk.object_name}"`,
      );
    }
    for (const t of targets) {
      await q.query(
        `ALTER TABLE "${t.table_name}" DROP CONSTRAINT "${t.object_name}"`,
      );
    }

    // ==================================================================
    // TAHAP 4  Tukar kolom. `DROP COLUMN "id"` otomatis ikut menghapus
    //          sequence `<tabel>_id_seq` yang OWNED BY kolom tersebut,
    //          jadi tidak ada sequence yatim yang tertinggal.
    // ==================================================================
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}" DROP COLUMN "${fk.column}"`,
      );
      await q.query(
        `ALTER TABLE "${fk.table_name}"
         RENAME COLUMN "${fk.column}__uuid" TO "${fk.column}"`,
      );
      if (fk.notnull) {
        await q.query(
          `ALTER TABLE "${fk.table_name}" ALTER COLUMN "${fk.column}" SET NOT NULL`,
        );
      }
    }
    for (const t of targets) {
      await q.query(`ALTER TABLE "${t.table_name}" DROP COLUMN "id"`);
      await q.query(
        `ALTER TABLE "${t.table_name}" RENAME COLUMN "id__uuid" TO "id"`,
      );
      await q.query(
        `ALTER TABLE "${t.table_name}"
         ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
      );
    }

    // ==================================================================
    // TAHAP 5  Pasang kembali constraint & index dengan NAMA YANG SAMA,
    //          supaya migrasi lain dan TypeORM tetap mengenalinya.
    // ==================================================================
    for (const t of targets) {
      await q.query(
        `ALTER TABLE "${t.table_name}"
         ADD CONSTRAINT "${t.object_name}" PRIMARY KEY ("id")`,
      );
    }
    for (const pk of compositePks) {
      const cols = pk.cols.map((c) => `"${c}"`).join(', ');
      await q.query(
        `ALTER TABLE "${pk.table_name}"
         ADD CONSTRAINT "${pk.object_name}" PRIMARY KEY (${cols})`,
      );
    }
    for (const u of uniqueCons) {
      await q.query(
        `ALTER TABLE "${u.table_name}" ADD CONSTRAINT "${u.object_name}" ${u.def}`,
      );
    }
    for (const ix of indexes) {
      await q.query(ix.def);
    }
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}"
         ADD CONSTRAINT "${fk.object_name}" FOREIGN KEY ("${fk.column}")
         REFERENCES "${fk.parent}" ("id")
         ON DELETE ${actionOf(fk.on_delete)} ON UPDATE ${actionOf(fk.on_update)}`,
      );
    }
  }

  // ====================================================================
  //  DOWN  Kembali ke integer PERSIS seperti semula, memakai legacy_id.
  //        Bukan sekadar "bikin integer baru" — nilai lamanya dipulihkan.
  // ====================================================================
  public async down(q: QueryRunner): Promise<void> {
    const [meta] = await q.query(
      `SELECT to_regclass('public._uuid_migration_meta') IS NOT NULL AS ok`,
    );
    if (!meta.ok) {
      throw new Error(
        'ConvertIdsToUuid.down(): tabel "_uuid_migration_meta" tidak ada, ' +
          'sehingga nama constraint asli tidak diketahui. Rollback dibatalkan — ' +
          'pulihkan dari backup pg_dump.',
      );
    }

    const targets: TargetMeta[] = await q.query(TARGET_SELECT);
    const fks: FkMeta[] = await q.query(FK_SELECT);
    const compositePks: CompositePkMeta[] = await q.query(COMPOSITE_PK_SELECT);
    const indexes: { def: string }[] = await q.query(INDEX_SELECT);
    const uniqueCons: UniqueMeta[] = await q.query(UNIQUE_SELECT);

    // 1. Kolom integer sementara, diisi dari legacy_id lewat JOIN uuid.
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}" ADD COLUMN "${fk.column}__int" integer`,
      );
      await q.query(
        `UPDATE "${fk.table_name}" c
         SET "${fk.column}__int" = p."legacy_id"
         FROM "${fk.parent}" p
         WHERE p."id" = c."${fk.column}"`,
      );
    }

    // 2. Lepas constraint.
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.object_name}"`,
      );
    }
    for (const u of uniqueCons) {
      await q.query(
        `ALTER TABLE "${u.table_name}" DROP CONSTRAINT "${u.object_name}"`,
      );
    }
    for (const pk of compositePks) {
      await q.query(
        `ALTER TABLE "${pk.table_name}" DROP CONSTRAINT "${pk.object_name}"`,
      );
    }
    for (const t of targets) {
      await q.query(
        `ALTER TABLE "${t.table_name}" DROP CONSTRAINT "${t.object_name}"`,
      );
    }

    // 3. Tukar balik kolom.
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}" DROP COLUMN "${fk.column}"`,
      );
      await q.query(
        `ALTER TABLE "${fk.table_name}"
         RENAME COLUMN "${fk.column}__int" TO "${fk.column}"`,
      );
      if (fk.notnull) {
        await q.query(
          `ALTER TABLE "${fk.table_name}" ALTER COLUMN "${fk.column}" SET NOT NULL`,
        );
      }
    }
    for (const t of targets) {
      await q.query(`ALTER TABLE "${t.table_name}" DROP COLUMN "id"`);
      await q.query(
        `ALTER TABLE "${t.table_name}" RENAME COLUMN "legacy_id" TO "id"`,
      );
      await q.query(
        `ALTER TABLE "${t.table_name}" ALTER COLUMN "id" SET NOT NULL`,
      );
      // Bangun ulang sequence serial dengan nama konvensional TypeORM,
      // lalu majukan ke max(id) supaya INSERT berikutnya tidak bentrok.
      const seq = `${t.table_name}_id_seq`;
      await q.query(`CREATE SEQUENCE IF NOT EXISTS "${seq}"`);
      await q.query(
        `ALTER TABLE "${t.table_name}" ALTER COLUMN "id" SET DEFAULT nextval('"${seq}"')`,
      );
      await q.query(`ALTER SEQUENCE "${seq}" OWNED BY "${t.table_name}"."id"`);
      await q.query(
        `SELECT setval('"${seq}"', COALESCE((SELECT max("id") FROM "${t.table_name}"), 0) + 1, false)`,
      );
    }

    // 4. Pasang kembali constraint & index.
    for (const t of targets) {
      await q.query(
        `ALTER TABLE "${t.table_name}"
         ADD CONSTRAINT "${t.object_name}" PRIMARY KEY ("id")`,
      );
    }
    for (const pk of compositePks) {
      const cols = pk.cols.map((c) => `"${c}"`).join(', ');
      await q.query(
        `ALTER TABLE "${pk.table_name}"
         ADD CONSTRAINT "${pk.object_name}" PRIMARY KEY (${cols})`,
      );
    }
    for (const u of uniqueCons) {
      await q.query(
        `ALTER TABLE "${u.table_name}" ADD CONSTRAINT "${u.object_name}" ${u.def}`,
      );
    }
    for (const ix of indexes) {
      await q.query(ix.def);
    }
    for (const fk of fks) {
      await q.query(
        `ALTER TABLE "${fk.table_name}"
         ADD CONSTRAINT "${fk.object_name}" FOREIGN KEY ("${fk.column}")
         REFERENCES "${fk.parent}" ("id")
         ON DELETE ${actionOf(fk.on_delete)} ON UPDATE ${actionOf(fk.on_update)}`,
      );
    }

    await q.query(`DROP TABLE "_uuid_migration_meta"`);
  }
}

interface TargetMeta {
  table_name: string;
  object_name: string;
}

interface FkMeta {
  table_name: string;
  object_name: string;
  column: string;
  parent: string;
  notnull: boolean;
  on_delete: string;
  on_update: string;
}

interface CompositePkMeta {
  table_name: string;
  object_name: string;
  cols: string[];
}

interface UniqueMeta {
  table_name: string;
  object_name: string;
  def: string;
}

const TARGET_SELECT = `
  SELECT table_name, object_name
  FROM "_uuid_migration_meta" WHERE kind = 'target_table'
  ORDER BY table_name
`;

const FK_SELECT = `
  SELECT table_name, object_name,
         payload ->> 'column'    AS column,
         payload ->> 'parent'    AS parent,
         (payload ->> 'notnull')::boolean AS notnull,
         payload ->> 'on_delete' AS on_delete,
         payload ->> 'on_update' AS on_update
  FROM "_uuid_migration_meta" WHERE kind = 'fk'
  ORDER BY table_name, object_name
`;

const COMPOSITE_PK_SELECT = `
  SELECT table_name, object_name,
         ARRAY(SELECT jsonb_array_elements_text(payload -> 'cols')) AS cols
  FROM "_uuid_migration_meta" WHERE kind = 'composite_pk'
  ORDER BY table_name
`;

const INDEX_SELECT = `
  SELECT payload ->> 'def' AS def
  FROM "_uuid_migration_meta" WHERE kind = 'index'
  ORDER BY table_name, object_name
`;

const UNIQUE_SELECT = `
  SELECT table_name, object_name, payload ->> 'def' AS def
  FROM "_uuid_migration_meta" WHERE kind = 'unique_constraint'
  ORDER BY table_name, object_name
`;

/** Kode confdeltype/confupdtype pg_constraint -> klausa SQL. */
function actionOf(code: string): string {
  switch (code) {
    case 'c':
      return 'CASCADE';
    case 'n':
      return 'SET NULL';
    case 'd':
      return 'SET DEFAULT';
    case 'r':
      return 'RESTRICT';
    default:
      return 'NO ACTION';
  }
}
