import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Info1758566990666 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                                       await queryRunner.createTable(new Table({
                                                            name: 'info',
                                                            columns: [{
                                                                name: 'id',
                                                                type: 'int',
                                                                isPrimary: true,
                                                                isGenerated: true,
                                                                generationStrategy: 'increment'
                                                            },{
                                                                name: 'icon',
                                                                type: 'varchar'
                                                            },
                                                            {
                                                                name: 'judul',
                                                                type: 'varchar'
                                                            },
                                                            {
                                                                name: 'text',
                                                                type: 'varchar'
                                                            },               {
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
        
    }

}
