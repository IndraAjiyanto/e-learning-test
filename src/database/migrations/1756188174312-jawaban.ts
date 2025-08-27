import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Jawaban1756188174312 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                await queryRunner.createTable(new Table({
                                    name: 'jawaban',
                                    columns: [{
                                        name: 'id',
                                        type: 'int',
                                        isPrimary: true,
                                        isGenerated: true,
                                        generationStrategy: 'increment'
                                    },{
                                        name: 'jawaban',
                                        type: 'varchar'
                                    },
                                    {
                                        name: 'jawaban_benar',
                                        type: 'boolean',
                                        default: false
                                    },
                                    {
                                        name: 'pertanyaanId',
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
                        
                                await queryRunner.createForeignKey('jawaban', new TableForeignKey({
                                    columnNames: ['pertanyaanId'],
                                    referencedTableName: 'pertanyaan',
                                    referencedColumnNames: ['id'],
                                    onDelete: 'RESTRICT',
                                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                  const table = await queryRunner.getTable('jawaban');
  if (!table) return;

  const pertanyaanFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertanyaanId'));

  if (pertanyaanFk) {
    await queryRunner.dropForeignKey('jawaban', pertanyaanFk);
  }

  await queryRunner.dropTable('jawaban');
    }

}
