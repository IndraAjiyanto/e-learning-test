import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Converts every integer primary key in the public schema to uuid, in place,
 * preserving all existing rows and every foreign-key relationship.
 *
 * The migration introspects the target database at run time rather than
 * hardcoding table and constraint names, so it works on any database that
 * still has the pre-migration integer schema -- not just the one it was
 * written against.
 *
 * It leaves five metadata tables behind on purpose:
 *
 *   id_mapping                 old integer id  <-> new uuid, per table
 *   id_migration_target        tables whose own id column was converted
 *   id_migration_ref           foreign-key columns that were converted
 *   id_migration_backup        primary/unique/foreign constraint definitions
 *   id_migration_index_backup  non-constraint index definitions
 *
 * down() needs all five. Dropping them makes the rollback impossible, so keep
 * them for as long as you want a rollback window. See the note on down().
 *
 * Excluded from conversion: `migrations` (TypeORM's own bookkeeping) and
 * `session` (connect-pg-simple, keyed by varchar sid).
 *
 * One visible side effect: because each id column is dropped and re-added,
 * it moves to the end of its table's column order. `SELECT *` therefore
 * returns id last. TypeORM always names its columns, so this is harmless
 * here, but any raw query relying on column position would need updating.
 */
export class IntIdToUuid1788220800000 implements MigrationInterface {
  name = 'IntIdToUuid1788220800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $mig$
DECLARE
  r        record;
  bad      bigint;
  n_target int;
  n_ref    int;
BEGIN
  -- ----------------------------------------------------------------
  -- 0. Preconditions
  -- ----------------------------------------------------------------
  IF to_regclass('public.id_mapping') IS NOT NULL THEN
    RAISE EXCEPTION 'id_mapping already exists - this database looks migrated already. Run the down migration first if you meant to redo it.';
  END IF;

  IF to_regprocedure('public.gen_random_uuid()') IS NULL
     AND to_regprocedure('pg_catalog.gen_random_uuid()') IS NULL THEN
    RAISE EXCEPTION 'gen_random_uuid() is not available. On PostgreSQL 13+ it is built in; on older versions run: CREATE EXTENSION pgcrypto;';
  END IF;

  -- ----------------------------------------------------------------
  -- 1. Discover what has to change
  -- ----------------------------------------------------------------

  -- Tables whose own primary key is a single integer column.
  CREATE TABLE id_migration_target AS
  SELECT c.relname::text  AS tbl,
         a.attname::text  AS idcol,
         k.conname::text  AS pkname
  FROM pg_constraint k
  JOIN pg_class c      ON c.oid = k.conrelid
  JOIN pg_namespace n  ON n.oid = c.relnamespace
  JOIN pg_attribute a  ON a.attrelid = c.oid AND a.attnum = k.conkey[1]
  WHERE k.contype = 'p'
    AND n.nspname = 'public'
    AND array_length(k.conkey, 1) = 1
    AND a.atttypid IN ('integer'::regtype, 'bigint'::regtype, 'smallint'::regtype)
    AND c.relname NOT IN ('migrations', 'session');

  SELECT count(*) INTO n_target FROM id_migration_target;
  IF n_target = 0 THEN
    RAISE EXCEPTION 'No integer primary keys found - nothing to migrate.';
  END IF;

  -- Foreign-key columns pointing at one of those primary keys.
  CREATE TABLE id_migration_ref AS
  SELECT DISTINCT
         c.relname::text  AS tbl,
         a.attname::text  AS col,
         pc.relname::text AS parent,
         a.attnotnull     AS was_notnull
  FROM pg_constraint k
  JOIN pg_class c      ON c.oid = k.conrelid
  JOIN pg_class pc     ON pc.oid = k.confrelid
  JOIN pg_namespace n  ON n.oid = c.relnamespace
  JOIN pg_attribute a  ON a.attrelid = c.oid AND a.attnum = k.conkey[1]
  WHERE k.contype = 'f'
    AND n.nspname = 'public'
    AND array_length(k.conkey, 1) = 1
    AND pc.relname IN (SELECT tbl FROM id_migration_target);

  SELECT count(*) INTO n_ref FROM id_migration_ref;

  -- Every column this migration will retype.
  CREATE TEMP TABLE _uuid_cols ON COMMIT DROP AS
  SELECT tbl, idcol AS col FROM id_migration_target
  UNION
  SELECT tbl, col          FROM id_migration_ref;

  RAISE NOTICE 'Converting % primary keys and % foreign-key columns to uuid.', n_target, n_ref;

  -- ----------------------------------------------------------------
  -- 2. Back up every constraint and index that touches those columns.
  --    pg_get_constraintdef preserves names, ON DELETE and ON UPDATE
  --    exactly, so recreation is faithful rather than reconstructed.
  --    Constraints that touch no converted column (for example the
  --    unique constraint on user.email) are deliberately left alone.
  -- ----------------------------------------------------------------
  CREATE TABLE id_migration_backup AS
  SELECT k.contype::text          AS kind,
         c.relname::text          AS tbl,
         k.conname::text          AS name,
         pg_get_constraintdef(k.oid) AS def
  FROM pg_constraint k
  JOIN pg_class c     ON c.oid = k.conrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND k.contype IN ('p', 'u', 'f')
    AND EXISTS (
      SELECT 1
      FROM unnest(k.conkey) ck
      JOIN pg_attribute a ON a.attrelid = k.conrelid AND a.attnum = ck
      JOIN _uuid_cols uc  ON uc.tbl = c.relname AND uc.col = a.attname
    );

  CREATE TABLE id_migration_index_backup AS
  SELECT ic.relname::text AS idx,
         tc.relname::text AS tbl,
         pg_get_indexdef(i.indexrelid) AS def
  FROM pg_index i
  JOIN pg_class ic    ON ic.oid = i.indexrelid
  JOIN pg_class tc    ON tc.oid = i.indrelid
  JOIN pg_namespace n ON n.oid = ic.relnamespace
  WHERE n.nspname = 'public'
    AND NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conindid = i.indexrelid)
    AND EXISTS (
      SELECT 1
      FROM unnest(i.indkey::int2[]) ik
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ik
      JOIN _uuid_cols uc  ON uc.tbl = tc.relname AND uc.col = a.attname
    );

  -- ----------------------------------------------------------------
  -- 3. Drop them, in dependency order: foreign, then unique, then primary
  -- ----------------------------------------------------------------
  FOR r IN SELECT tbl, name FROM id_migration_backup WHERE kind = 'f' LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.tbl, r.name);
  END LOOP;

  FOR r IN SELECT tbl, name FROM id_migration_backup WHERE kind = 'u' LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.tbl, r.name);
  END LOOP;

  FOR r IN SELECT tbl, name FROM id_migration_backup WHERE kind = 'p' LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.tbl, r.name);
  END LOOP;

  FOR r IN SELECT idx FROM id_migration_index_backup LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', r.idx);
  END LOOP;

  -- ----------------------------------------------------------------
  -- 4. Allocate one uuid per existing row, per table
  -- ----------------------------------------------------------------
  CREATE TABLE id_mapping (
    table_name  text    NOT NULL,
    old_id      bigint  NOT NULL,
    new_uuid    uuid    NOT NULL DEFAULT gen_random_uuid(),
    migrated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (table_name, old_id),
    UNIQUE (table_name, new_uuid)
  );

  FOR r IN SELECT tbl, idcol FROM id_migration_target LOOP
    EXECUTE format(
      'INSERT INTO id_mapping(table_name, old_id) SELECT %L, %I FROM %I',
      r.tbl, r.idcol, r.tbl);
  END LOOP;

  -- ----------------------------------------------------------------
  -- 5. Add the uuid columns and fill them
  -- ----------------------------------------------------------------
  FOR r IN SELECT tbl, idcol FROM id_migration_target LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN __new_id uuid', r.tbl);
    EXECUTE format(
      'UPDATE %I t SET __new_id = m.new_uuid FROM id_mapping m
         WHERE m.table_name = %L AND m.old_id = t.%I',
      r.tbl, r.tbl, r.idcol);
  END LOOP;

  -- Child columns resolve through the mapping of their own parent table.
  -- A self-referencing column (coment.repliesId) works unchanged here,
  -- because the parent rows were mapped in step 4 before this point.
  FOR r IN SELECT tbl, col, parent FROM id_migration_ref LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I uuid', r.tbl, r.col || '__new');
    EXECUTE format(
      'UPDATE %I t SET %I = m.new_uuid FROM id_mapping m
         WHERE m.table_name = %L AND m.old_id = t.%I',
      r.tbl, r.col || '__new', r.parent, r.col);
  END LOOP;

  -- ----------------------------------------------------------------
  -- 6. Verify before destroying anything. Failing here aborts the whole
  --    transaction with the old schema and data still intact.
  -- ----------------------------------------------------------------
  FOR r IN SELECT tbl, idcol FROM id_migration_target LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE __new_id IS NULL', r.tbl) INTO bad;
    IF bad > 0 THEN
      RAISE EXCEPTION 'Table %: % rows got no uuid', r.tbl, bad;
    END IF;
  END LOOP;

  FOR r IN SELECT tbl, col FROM id_migration_ref LOOP
    EXECUTE format(
      'SELECT count(*) FROM %I WHERE %I IS NOT NULL AND %I IS NULL',
      r.tbl, r.col, r.col || '__new') INTO bad;
    IF bad > 0 THEN
      RAISE EXCEPTION 'Column %.%: % rows reference a parent that could not be mapped', r.tbl, r.col, bad;
    END IF;
  END LOOP;

  -- ----------------------------------------------------------------
  -- 7. Swap. Dropping a serial column drops its owned sequence too.
  -- ----------------------------------------------------------------
  FOR r IN SELECT tbl, idcol FROM id_migration_target LOOP
    EXECUTE format('ALTER TABLE %I DROP COLUMN %I', r.tbl, r.idcol);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN __new_id TO %I', r.tbl, r.idcol);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', r.tbl, r.idcol);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT gen_random_uuid()', r.tbl, r.idcol);
  END LOOP;

  FOR r IN SELECT tbl, col, was_notnull FROM id_migration_ref LOOP
    EXECUTE format('ALTER TABLE %I DROP COLUMN %I', r.tbl, r.col);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', r.tbl, r.col || '__new', r.col);
    IF r.was_notnull THEN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', r.tbl, r.col);
    END IF;
  END LOOP;

  -- ----------------------------------------------------------------
  -- 8. Rebuild constraints and indexes from the saved definitions
  -- ----------------------------------------------------------------
  FOR r IN SELECT tbl, name, def FROM id_migration_backup WHERE kind = 'p' LOOP
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', r.tbl, r.name, r.def);
  END LOOP;

  FOR r IN SELECT tbl, name, def FROM id_migration_backup WHERE kind = 'u' LOOP
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', r.tbl, r.name, r.def);
  END LOOP;

  FOR r IN SELECT tbl, name, def FROM id_migration_backup WHERE kind = 'f' LOOP
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', r.tbl, r.name, r.def);
  END LOOP;

  FOR r IN SELECT def FROM id_migration_index_backup LOOP
    EXECUTE r.def;
  END LOOP;

  -- ----------------------------------------------------------------
  -- 9. Sessions store the integer user id inside their JSON payload,
  --    so they cannot survive. Everyone signs in again.
  -- ----------------------------------------------------------------
  IF to_regclass('public.session') IS NOT NULL THEN
    DELETE FROM session;
  END IF;

  RAISE NOTICE 'Done. Keep id_mapping and the id_migration_* tables for as long as you want to be able to roll back.';
END
$mig$;
    `);
  }

  /**
   * Rolls back to integer ids.
   *
   * This is honest about its limits. It is faithful only for rows that
   * existed when up() ran: those recover their original integer ids from
   * id_mapping. Rows created afterwards have no original id, so they are
   * given fresh integers from the rebuilt sequence -- values that never
   * existed before, and any external reference to their uuid breaks.
   * Sessions were deleted by up() and do not come back.
   *
   * If the id_migration_* tables have been dropped, this cannot run at all.
   * The genuinely lossless recovery path is restoring a pre-migration
   * pg_dump, not this function.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $mig$
DECLARE
  r         record;
  orphans   bigint;
  seqname   text;
  parent_id text;
BEGIN
  IF to_regclass('public.id_mapping') IS NULL
     OR to_regclass('public.id_migration_target') IS NULL
     OR to_regclass('public.id_migration_ref') IS NULL
     OR to_regclass('public.id_migration_backup') IS NULL
     OR to_regclass('public.id_migration_index_backup') IS NULL THEN
    RAISE EXCEPTION 'The id_migration_* metadata is gone - this rollback cannot run. Restore a pre-migration pg_dump instead.';
  END IF;

  -- Warn, loudly, about rows that postdate the migration.
  FOR r IN SELECT tbl, idcol FROM id_migration_target LOOP
    EXECUTE format(
      'SELECT count(*) FROM %I t LEFT JOIN id_mapping m
         ON m.table_name = %L AND m.new_uuid = t.%I
       WHERE m.old_id IS NULL',
      r.tbl, r.tbl, r.idcol) INTO orphans;
    IF orphans > 0 THEN
      RAISE WARNING 'Table %: % rows were created after the migration and will receive brand-new integer ids.', r.tbl, orphans;
    END IF;
  END LOOP;

  -- 1. Drop the current constraints and indexes
  FOR r IN SELECT tbl, name FROM id_migration_backup WHERE kind = 'f' LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.tbl, r.name);
  END LOOP;
  FOR r IN SELECT tbl, name FROM id_migration_backup WHERE kind = 'u' LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.tbl, r.name);
  END LOOP;
  FOR r IN SELECT tbl, name FROM id_migration_backup WHERE kind = 'p' LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.tbl, r.name);
  END LOOP;
  FOR r IN SELECT idx FROM id_migration_index_backup LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', r.idx);
  END LOOP;

  -- 2. Parents: restore integer ids, minting new ones where none existed
  FOR r IN SELECT tbl, idcol FROM id_migration_target LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN __old_id bigint', r.tbl);
    EXECUTE format(
      'UPDATE %I t SET __old_id = m.old_id FROM id_mapping m
         WHERE m.table_name = %L AND m.new_uuid = t.%I',
      r.tbl, r.tbl, r.idcol);

    seqname := r.tbl || '_' || r.idcol || '_seq';
    EXECUTE format('CREATE SEQUENCE %I', seqname);
    EXECUTE format(
      'SELECT setval(%L, GREATEST(
          COALESCE((SELECT max(old_id) FROM id_mapping WHERE table_name = %L), 0),
          1))',
      seqname, r.tbl);
    EXECUTE format(
      'UPDATE %I SET __old_id = nextval(%L) WHERE __old_id IS NULL',
      r.tbl, seqname);
  END LOOP;

  -- 3. Children: resolve back through the parent's restored integer id
  FOR r IN SELECT tbl, col, parent FROM id_migration_ref LOOP
    SELECT idcol INTO parent_id FROM id_migration_target WHERE tbl = r.parent;
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I bigint', r.tbl, r.col || '__old');
    EXECUTE format(
      'UPDATE %I c SET %I = p.__old_id FROM %I p WHERE p.%I = c.%I',
      r.tbl, r.col || '__old', r.parent, parent_id, r.col);
  END LOOP;

  -- 4. Swap back
  FOR r IN SELECT tbl, idcol FROM id_migration_target LOOP
    seqname := r.tbl || '_' || r.idcol || '_seq';
    EXECUTE format('ALTER TABLE %I DROP COLUMN %I', r.tbl, r.idcol);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN __old_id TO %I', r.tbl, r.idcol);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE integer', r.tbl, r.idcol);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', r.tbl, r.idcol);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT nextval(%L)', r.tbl, r.idcol, seqname);
    EXECUTE format('ALTER SEQUENCE %I OWNED BY %I.%I', seqname, r.tbl, r.idcol);
  END LOOP;

  FOR r IN SELECT tbl, col, was_notnull FROM id_migration_ref LOOP
    EXECUTE format('ALTER TABLE %I DROP COLUMN %I', r.tbl, r.col);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', r.tbl, r.col || '__old', r.col);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE integer', r.tbl, r.col);
    IF r.was_notnull THEN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', r.tbl, r.col);
    END IF;
  END LOOP;

  -- 5. Rebuild the original constraints and indexes
  FOR r IN SELECT tbl, name, def FROM id_migration_backup WHERE kind = 'p' LOOP
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', r.tbl, r.name, r.def);
  END LOOP;
  FOR r IN SELECT tbl, name, def FROM id_migration_backup WHERE kind = 'u' LOOP
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', r.tbl, r.name, r.def);
  END LOOP;
  FOR r IN SELECT tbl, name, def FROM id_migration_backup WHERE kind = 'f' LOOP
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', r.tbl, r.name, r.def);
  END LOOP;
  FOR r IN SELECT def FROM id_migration_index_backup LOOP
    EXECUTE r.def;
  END LOOP;

  IF to_regclass('public.session') IS NOT NULL THEN
    DELETE FROM session;
  END IF;

  DROP TABLE id_migration_index_backup;
  DROP TABLE id_migration_backup;
  DROP TABLE id_migration_ref;
  DROP TABLE id_migration_target;
  DROP TABLE id_mapping;
END
$mig$;
    `);
  }
}
