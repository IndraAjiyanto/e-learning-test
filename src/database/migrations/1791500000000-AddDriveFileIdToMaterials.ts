import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDriveFileIdToMaterials1791500000000
    implements MigrationInterface {
    name = 'AddDriveFileIdToMaterials1791500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('material');
        if (!table || table.findColumnByName('driveFileId')) return;

        await queryRunner.addColumn(
            'material',
            new TableColumn({
                name: 'driveFileId',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('material');
        if (!table?.findColumnByName('driveFileId')) return;

        await queryRunner.dropColumn('material', 'driveFileId');
    }
}
