import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Tugas1756188186972 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                        await queryRunner.createTable(new Table({
                                            name: 'tugas',
                                            columns: [{
                                                name: 'id',
                                                type: 'int',
                                                isPrimary: true,
                                                isGenerated: true,
                                                generationStrategy: 'increment'
                                            },{
                                                name: 'file',
                                                type: 'varchar'
                                            },{
                                                name: 'pertemuanId',
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
                                
                                        await queryRunner.createForeignKey('tugas', new TableForeignKey({
                                            columnNames: ['pertemuanId'],
                                            referencedTableName: 'pertemuan',
                                            referencedColumnNames: ['id'],
                                            onDelete: 'RESTRICT',
                                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                          const table = await queryRunner.getTable('tugas');
  if (!table) return;

  const pertemuanFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertemuanId'));

  if (pertemuanFk) {
    await queryRunner.dropForeignKey('tugas', pertemuanFk);
  }


  await queryRunner.dropTable('tugas');
    }

}
