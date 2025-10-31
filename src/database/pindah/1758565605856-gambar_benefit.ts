import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class GambarBenefit1758565605856 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                               await queryRunner.createTable(new Table({
                                    name: 'gambar_benefit',
                                    columns: [{
                                        name: 'id',
                                        type: 'int',
                                        isPrimary: true,
                                        isGenerated: true,
                                        generationStrategy: 'increment'
                                    },{
                                        name: 'gambar',
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
