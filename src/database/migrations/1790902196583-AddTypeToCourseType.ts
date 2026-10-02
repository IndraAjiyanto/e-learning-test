import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTypeToCourseType1790902196583 implements MigrationInterface {
  name = 'AddTypeToCourseType1790902196583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_type_enum_badge') THEN
          CREATE TYPE "course_type_enum_badge" AS ENUM('hacker', 'hipster', 'hustler');
        END IF;
      END$$;
    `);

    await queryRunner.addColumn(
      'course_type',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enumName: 'course_type_enum_badge',
        enum: ['hacker', 'hipster', 'hustler'],
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('course_type', 'type');
    await queryRunner.query(`DROP TYPE IF EXISTS "course_type_enum_badge"`);
  }
}
