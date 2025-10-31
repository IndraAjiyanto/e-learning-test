import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Blog1761533132133 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.createTable(new Table({
                    name: 'blog',
                    columns: [{
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name: 'judul',
                        type: 'varchar',
                    },
                    {
                        name: 'isi',
                        type: 'varchar'
                    },
                    {
                        name: 'gambar',
                        type: 'varchar'
                    },
                    {
                        name: 'kategori_blogId',
                        type: 'int'
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
            await queryRunner.createForeignKey('blog', new TableForeignKey({
                    columnNames: ['kategori_blogId'],
                    referencedTableName: 'kategori_blog',
                    referencedColumnNames: ['id'],
                    onDelete: 'RESTRICT',
                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
