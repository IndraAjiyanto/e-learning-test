import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Benefit1758565349981 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                       await queryRunner.createTable(new Table({
                            name: 'benefit',
                            columns: [{
                                name: 'id',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: 'increment'
                            },{
                                name: 'judul',
                                type: 'varchar'
                            },{
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
