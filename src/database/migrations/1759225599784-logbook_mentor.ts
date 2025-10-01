import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class LogbookMentor1759225599784 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                            await queryRunner.createTable(new Table({
                                name: 'logbook_mentor',
                                columns: [{
                                    name: 'id',
                                    type: 'int',
                                    isPrimary: true,
                                    isGenerated: true,
                                    generationStrategy: 'increment'
                                },{
                                    name: 'kegiatan',
                                    type: 'varchar'
                                },{
                                    name: 'rincian_kegiatan',
                                    type: 'varchar'
                                },
                                {
                                    name: 'kendala',
                                    type: 'varchar'
                                },
                                {
                                   name: 'dokumentasi',
                                   type: 'varchar'
                               },{
                                    name: 'userId',
                                    type: 'int'
                                },{
                                   name: 'pertemuanId',
                                   type: 'int'
                                },{
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
       
                                                                            await queryRunner.createForeignKey('logbook_mentor', new TableForeignKey({
                                                                                columnNames: ['userId'],
                                                                                referencedTableName: 'user',
                                                                                referencedColumnNames: ['id'],
                                                                                onDelete: "CASCADE",
                                                                            }));
                                                                            await queryRunner.createForeignKey('logbook_mentor', new TableForeignKey({
                                                                                columnNames: ['pertemuanId'],
                                                                                referencedTableName: 'pertemuan',
                                                                                referencedColumnNames: ['id'],
                                                                                onDelete: "CASCADE",
                                                                            }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
