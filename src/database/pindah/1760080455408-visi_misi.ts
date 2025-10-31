import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class VisiMisi1760080455408 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                                                       await queryRunner.createTable(new Table({
                                                                            name: 'visi_misi',
                                                                            columns: [{
                                                                                name: 'id',
                                                                                type: 'int',
                                                                                isPrimary: true,
                                                                                isGenerated: true,
                                                                                generationStrategy: 'increment'
                                                                            },{
                                                                                name: 'visi',
                                                                                type: 'varchar'
                                                                            },
                                                                            {
                                                                                name: 'misi',
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
        
    }

}
