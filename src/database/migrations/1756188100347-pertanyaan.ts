import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Pertanyaan1756188100347 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                        await queryRunner.createTable(new Table({
                            name: 'pertanyaan',
                            columns: [{
                                name: 'id',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: 'increment'
                            },{
                                name: 'pertanyaan_soal',
                                type: 'varchar'
                            },
                            {
                                name: 'nilai',
                                type: 'int'
                            },
                                {
                                name: 'materiId',
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
                
                        await queryRunner.createForeignKey('pertanyaan', new TableForeignKey({
                            columnNames: ['materiId'],
                            referencedTableName: 'materi',
                            referencedColumnNames: ['id'],
                            onDelete: 'RESTRICT',
                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                  const table = await queryRunner.getTable('pertanyaan');
  if (!table) return;

  const materiFk = table.foreignKeys.find(fk => fk.columnNames.includes('materiId'));

  if (materiFk) {
    await queryRunner.dropForeignKey('pertanyaan', materiFk);
  }


  await queryRunner.dropTable('pertanyaan');
    }

}
