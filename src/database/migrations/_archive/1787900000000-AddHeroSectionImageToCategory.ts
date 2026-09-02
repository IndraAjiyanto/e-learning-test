import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddHeroSectionImageToCategory1787900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('category', 'hero_section_image'))) {
      await queryRunner.addColumn(
        'category',
        new TableColumn({
          name: 'hero_section_image',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('category', 'hero_section_image');
  }
}
