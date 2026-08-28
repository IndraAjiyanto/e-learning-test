import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddNoToGallery1786595254826 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn('gallery', 'no'))) {
            await queryRunner.addColumn(
                'gallery',
                new TableColumn({
                    name: 'no',
                    type: 'enum',
                    enum: ['1', '2', '3', '4', '5', '6']
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('gallery', 'no');
    }

}
