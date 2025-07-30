import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex, TableInheritance } from "typeorm";

export class Kelas1753670172780 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'kelas',
            columns: [{
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment'
            },
            {
                name: 'nama_kelas',
                type: 'varchar',
            },
            {
                name: 'deskripsi',
                type: 'varchar'
            },
            {
                name: 'createdAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
            },
            {
                name: 'updatedAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
            }
            ]
        }))

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('kelass');
    }

}
