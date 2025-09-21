import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Kategori1753646654761 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.createTable(new Table({
                    name: 'kategori',
                    columns: [{
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name: 'nama_kategori',
                        type: 'varchar',
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
        await queryRunner.dropTable('kategori');
    }

}
