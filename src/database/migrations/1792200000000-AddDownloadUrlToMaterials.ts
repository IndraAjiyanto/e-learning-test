import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDownloadUrlToMaterials1792200000000 implements MigrationInterface {
  name = 'AddDownloadUrlToMaterials1792200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('material');
    if (!table || table.findColumnByName('downloadUrl')) return;

    await queryRunner.addColumn(
      'material',
      new TableColumn({
        name: 'downloadUrl',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('material');
    if (!table?.findColumnByName('downloadUrl')) return;

    await queryRunner.dropColumn('material', 'downloadUrl');
  }
}
