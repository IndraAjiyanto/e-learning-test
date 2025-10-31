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
                                                    },
                                                    {
                                                        name: 'nilai',
                                                        type: 'int'
                                                    },
                                                    {
                                                        name: 'tugasId',
                                                        type: 'int'
                                                    },{
                                                        name: 'userId',
                                                        type: 'int'
                                                    },
                                                         {
                    name: 'proses',
                    type: 'enum',
                    enum: ['acc', 'proces', 'rejected']
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
                                                    onDelete: "CASCADE",
                                                }));
                                                await queryRunner.createForeignKey('jawaban_tugas', new TableForeignKey({
                                                    columnNames: ['userId'],
                                                    referencedTableName: 'user',
                                                    referencedColumnNames: ['id'],
                                                    onDelete: "CASCADE",
                                                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                                  const table = await queryRunner.getTable('jawaban_tugas');
  if (!table) return;

  const tugasFk = table.foreignKeys.find(fk => fk.columnNames.includes('tugasId'));
  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));

  if (tugasFk) {
    await queryRunner.dropForeignKey('jawaban_tugas', tugasFk);
  }
  if (userFk) {
    await queryRunner.dropForeignKey('jawaban_tugas', userFk);
  }


  await queryRunner.dropTable('jawaban_tugas');
    }

}
