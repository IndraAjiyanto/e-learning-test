import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSyllabusIdToMaterials1792100000000 implements MigrationInterface {
  name = 'AddSyllabusIdToMaterials1792100000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE "material"
        ADD COLUMN IF NOT EXISTS "syllabusId" uuid NULL,
        ADD COLUMN IF NOT EXISTS "originalFileName" character varying NULL,
        ADD COLUMN IF NOT EXISTS "fileSizeBytes" bigint NULL,
        ADD COLUMN IF NOT EXISTS "durationSeconds" character varying NULL;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_material_syllabus') THEN
          ALTER TABLE "material"
            ADD CONSTRAINT "FK_material_syllabus"
            FOREIGN KEY ("syllabusId") REFERENCES "syllabus"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS "IDX_material_syllabusId" ON "material" ("syllabusId");
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`
      DROP INDEX IF EXISTS "IDX_material_syllabusId";
      ALTER TABLE "material" DROP CONSTRAINT IF EXISTS "FK_material_syllabus";
      ALTER TABLE "material"
        DROP COLUMN IF EXISTS "syllabusId",
        DROP COLUMN IF EXISTS "originalFileName",
        DROP COLUMN IF EXISTS "fileSizeBytes",
        DROP COLUMN IF EXISTS "durationSeconds";
    `);
  }
}
