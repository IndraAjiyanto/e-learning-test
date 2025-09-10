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
                                                name: 'jawabanId',
                                                type: 'int'
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
                                            onDelete: "CASCADE",
                                        }));
                                        await queryRunner.createForeignKey('jawaban_user', new TableForeignKey({
                                            columnNames: ['jawabanId'],
                                            referencedTableName: 'jawaban',
                                            referencedColumnNames: ['id'],
                                            onDelete: "CASCADE",
                                        }));
                                        await queryRunner.createForeignKey('jawaban_user', new TableForeignKey({
                                            columnNames: ['userId'],
                                            referencedTableName: 'user',
                                            referencedColumnNames: ['id'],
                                            onDelete: "CASCADE",
                                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                          const table = await queryRunner.getTable('jawaban_user');
  if (!table) return;

  const pertanyaanFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertanyaanId'));
  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const jawabanFk = table.foreignKeys.find(fk => fk.columnNames.includes('jawabanId'));

  if (userFk) {
    await queryRunner.dropForeignKey('jawaban_user', userFk);
  }
  if (jawabanFk) {
    await queryRunner.dropForeignKey('jawaban_user', jawabanFk);
  }
  if (pertanyaanFk) {
    await queryRunner.dropForeignKey('jawaban_user', pertanyaanFk);
  }

  await queryRunner.dropTable('jawaban_user');
    }

}
