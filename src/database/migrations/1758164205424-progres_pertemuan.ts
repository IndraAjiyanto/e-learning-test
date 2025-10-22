import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ProgresPertemuan1758164205424 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                  await queryRunner.createTable(new Table({
                                            name: 'progres_pertemuan',
                                            columns: [{
                                                name: 'id',
                                                type: 'int',
                                                isPrimary: true,
                                                isGenerated: true,
                                                generationStrategy: 'increment'
                                            },
                                            {
                                                name: 'pertemuanId',
                                                type: 'int'
                                            },
                                            {
                                                name: 'userId',
                                                type: 'int'
                                            },
                                            {
                                                name: 'logbook',
                                                type: 'boolean',
                                                default: false
                                            },
                                            {
                                                name: 'absen',
                                                type: 'boolean',
                                                default: false
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
                                    await queryRunner.createForeignKey('progres_pertemuan', new TableForeignKey({
                                            columnNames: ['userId'],
                                            referencedTableName: 'user',
                                            referencedColumnNames: ['id'],
                                                        onDelete: "CASCADE",
                                        }));
                                    await queryRunner.createForeignKey('progres_pertemuan', new TableForeignKey({
                                            columnNames: ['pertemuanId'],
                                            referencedTableName: 'pertemuan',
                                            referencedColumnNames: ['id'],
                                                        onDelete: "CASCADE",
                                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
