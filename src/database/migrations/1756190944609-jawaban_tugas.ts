import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class JawabanTugas1756190944609 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                                await queryRunner.createTable(new Table({
                                                    name: 'jawaban_tugas',
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
                                                        name: 'tugasId',
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
                                        
                                                await queryRunner.createForeignKey('jawaban_tugas', new TableForeignKey({
                                                    columnNames: ['tugasId'],
                                                    referencedTableName: 'tugas',
                                                    referencedColumnNames: ['id'],
                                                    onDelete: 'RESTRICT',
                                                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                                  const table = await queryRunner.getTable('jawaban_tugas');
  if (!table) return;

  const tugasFk = table.foreignKeys.find(fk => fk.columnNames.includes('tugasId'));

  if (tugasFk) {
    await queryRunner.dropForeignKey('jawaban_tugas', tugasFk);
  }


  await queryRunner.dropTable('jawaban_tugas');
    }

}
