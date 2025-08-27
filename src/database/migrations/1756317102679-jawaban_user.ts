import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class JawabanUser1756317102679 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                        await queryRunner.createTable(new Table({
                                            name: 'jawaban_user',
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
                                                name: 'pertanyaanId',
                                                type: 'int'
                                            },
                                            {
                                                name: 'userId',
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
                                
                                        await queryRunner.createForeignKey('jawaban_user', new TableForeignKey({
                                            columnNames: ['pertanyaanId'],
                                            referencedTableName: 'pertanyaan',
                                            referencedColumnNames: ['id'],
                                            onDelete: 'RESTRICT',
                                        }));
                                        await queryRunner.createForeignKey('jawaban_user', new TableForeignKey({
                                            columnNames: ['userId'],
                                            referencedTableName: 'user',
                                            referencedColumnNames: ['id'],
                                            onDelete: 'RESTRICT',
                                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                          const table = await queryRunner.getTable('jawaban_user');
  if (!table) return;

  const pertanyaanFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertanyaanId'));
  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));

  if (userFk) {
    await queryRunner.dropForeignKey('jawaban_user', userFk);
  }
  if (pertanyaanFk) {
    await queryRunner.dropForeignKey('jawaban_user', pertanyaanFk);
  }

  await queryRunner.dropTable('jawaban_user');
    }

}
