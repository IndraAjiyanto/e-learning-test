import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProcessEnumValues1787000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['course', 'payments', 'registrations', 'answer_task', 'logbook'];

    for (const table of tables) {
      const enumTypeName = `${table}_process_enum`;
      const tempTypeName = `temp_${table}_process_enum`;

      await queryRunner.query(`CREATE TYPE "public"."${tempTypeName}" AS ENUM('approved', 'process', 'rejected')`);

      await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "process" DROP DEFAULT`);

      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "process" TYPE "public"."${tempTypeName}" ` +
        `USING CASE ` +
        `WHEN "process"::text = 'acc' THEN 'approved'::${tempTypeName} ` +
        `WHEN "process"::text = 'proces' THEN 'process'::${tempTypeName} ` +
        `WHEN "process"::text = 'rejected' THEN 'rejected'::${tempTypeName} ` +
        `END`
      );

      await queryRunner.query(`DROP TYPE "public"."${enumTypeName}"`);
      await queryRunner.query(`ALTER TYPE "public"."${tempTypeName}" RENAME TO "${enumTypeName}"`);

      await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "process" SET DEFAULT 'rejected'::"${enumTypeName}"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['course', 'payments', 'registrations', 'answer_task', 'logbook'];

    for (const table of tables) {
      const enumTypeName = `${table}_process_enum`;
      const tempTypeName = `temp_${table}_process_enum`;

      await queryRunner.query(`CREATE TYPE "public"."${tempTypeName}" AS ENUM('acc', 'proces', 'rejected')`);

      await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "process" DROP DEFAULT`);

      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "process" TYPE "public"."${tempTypeName}" ` +
        `USING CASE ` +
        `WHEN "process"::text = 'approved' THEN 'acc'::${tempTypeName} ` +
        `WHEN "process"::text = 'process' THEN 'proces'::${tempTypeName} ` +
        `WHEN "process"::text = 'rejected' THEN 'rejected'::${tempTypeName} ` +
        `END`
      );

      await queryRunner.query(`DROP TYPE "public"."${enumTypeName}"`);
      await queryRunner.query(`ALTER TYPE "public"."${tempTypeName}" RENAME TO "${enumTypeName}"`);

      await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "process" SET DEFAULT 'rejected'::"${enumTypeName}"`);
    }
  }
}
