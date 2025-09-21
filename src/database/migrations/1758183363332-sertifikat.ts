import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Sertifikat1758183363332 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.createTable(new Table({
                    name: 'sertifikat',
                    columns: [{
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },{
                        name: 'sertif',
                        type: 'varchar'
                    },{
                        name: 'userId',
                        type: 'int'
                    },{
                        name: 'kelasId',
                        type: 'int'
                    },                {
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
        
                await queryRunner.createForeignKey('sertifikat', new TableForeignKey({
                    columnNames: ['userId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: "CASCADE",
                }));
        
                await queryRunner.createForeignKey('sertifikat', new TableForeignKey({
                    columnNames: ['kelasId'],
                    referencedTableName: 'kelas',
                    referencedColumnNames: ['id'],
                    onDelete: "CASCADE",
                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
