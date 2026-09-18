# Diagram basis data

`database-diagram.drawio` — buka dengan [diagrams.net](https://app.diagrams.net)
atau ekstensi Draw.io Integration di VS Code.

Tujuh tab: **Overview**, lalu satu tab per kelompok (Learning core, Users &
enrolment, Payments, Catalog & taxonomy, Marketing CMS, Ops).

- **PK / FK / UQ** ditandai tebal di depan nama kolom, `NN` berarti NOT NULL.
- Tiap kolom foreign key menyebut tujuannya: `userId : uuid → user`.
- Warna garis = aturan `ON DELETE`: merah CASCADE, hijau SET NULL, abu NO ACTION.
- Tabel **bergaris putus-putus** adalah RUJUKAN ke kelompok lain (mis. `user`
  muncul di beberapa tab), bukan tabel kedua. Ini dipakai supaya setiap foreign
  key punya kedua ujungnya di halaman yang sama — semua 69 relasi tergambar.

## Membuat ulang

Diagramnya dibuat dari skema yang BENAR-BENAR ada di basis data
(`information_schema` + `pg_constraint`), bukan dari berkas entity, supaya
kolom hasil migrasi ikut terbaca.

```bash
docker exec elt-postgres psql -U postgres -d e_learning_migrasi_test -At -F'|' \
  -f /dev/stdin > docs/schema/cols.txt <<'SQL'
SELECT c.table_name, c.column_name, c.data_type, c.is_nullable,
       COALESCE(pk.is_pk,''), COALESCE(uq.is_uq,'')
FROM information_schema.columns c
LEFT JOIN (SELECT kcu.table_name, kcu.column_name, 'PK' AS is_pk
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu USING (constraint_name)
           WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema='public') pk
  ON pk.table_name=c.table_name AND pk.column_name=c.column_name
LEFT JOIN (SELECT kcu.table_name, kcu.column_name, 'UQ' AS is_uq
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu USING (constraint_name)
           WHERE tc.constraint_type='UNIQUE' AND tc.table_schema='public') uq
  ON uq.table_name=c.table_name AND uq.column_name=c.column_name
WHERE c.table_schema='public'
ORDER BY c.table_name, c.ordinal_position;
SQL

docker exec elt-postgres psql -U postgres -d e_learning_migrasi_test -At -F'|' \
  -f /dev/stdin > docs/schema/fks.txt <<'SQL'
SELECT src.relname, sa.attname, tgt.relname, ta.attname,
       CASE con.confdeltype WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL'
            WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT'
            WHEN 'd' THEN 'SET DEFAULT' END
FROM pg_constraint con
JOIN pg_class src ON src.oid=con.conrelid
JOIN pg_class tgt ON tgt.oid=con.confrelid
JOIN pg_namespace n ON n.oid=src.relnamespace
JOIN unnest(con.conkey)  WITH ORDINALITY AS sk(attnum,ord) ON true
JOIN unnest(con.confkey) WITH ORDINALITY AS tk(attnum,ord) ON tk.ord=sk.ord
JOIN pg_attribute sa ON sa.attrelid=src.oid AND sa.attnum=sk.attnum
JOIN pg_attribute ta ON ta.attrelid=tgt.oid AND ta.attnum=tk.attnum
WHERE n.nspname='public' AND con.contype='f'
ORDER BY src.relname, sa.attname;
SQL

python3 docs/database-diagram.gen.py
```

Tabel baru yang belum terdaftar di `DOMAINS` (di kepala `database-diagram.gen.py`)
membuat generator berhenti dengan pesan, bukan diam-diam menghilang dari diagram.
