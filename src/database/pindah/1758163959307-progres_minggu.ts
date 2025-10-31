import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ProgresMinggu1758163959307 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                          await queryRunner.createTable(new Table({
                                    name: 'progres_minggu',
                                    columns: [{
                                        name: 'id',
                                        type: 'int',
                                        isPrimary: true,
                                        isGenerated: true,
                                        generationStrategy: 'increment'
                                    },
                                    {
                                        name: 'mingguId',
                                        type: 'int'
                                    },
                                    {
                                        name: 'userId',
                                        type: 'int'
                                    },
                                                                     {
                                        name: 'quiz',
                                        type: 'boolean',
                                        default: false
                                    },
                                                                     {
                                        name: 'proses',
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
                            await queryRunner.createForeignKey('progres_minggu', new TableForeignKey({
                                    columnNames: ['userId'],
                                    referencedTableName: 'user',
                                    referencedColumnNames: ['id'],
                                                onDelete: "CASCADE",
                                }));
                            await queryRunner.createForeignKey('progres_minggu', new TableForeignKey({
                                    columnNames: ['mingguId'],
                                    referencedTableName: 'minggu',
                                    referencedColumnNames: ['id'],
                                                onDelete: "CASCADE",
                                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
