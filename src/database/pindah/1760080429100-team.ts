import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Team1760080429100 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                                               await queryRunner.createTable(new Table({
                                                                    name: 'team',
                                                                    columns: [{
                                                                        name: 'id',
                                                                        type: 'int',
                                                                        isPrimary: true,
                                                                        isGenerated: true,
                                                                        generationStrategy: 'increment'
                                                                    },{
                                                                        name: 'profile',
                                                                        type: 'varchar'
                                                                    },
                                                                    {
                                                                        name: 'nama',
                                                                        type: 'varchar'
                                                                    },
                                                                    {
                                                                        name: 'posisi',
                                                                        type: 'varchar'
                                                                    },
                                                                    {
                                                                        name: 'linkedin',
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
