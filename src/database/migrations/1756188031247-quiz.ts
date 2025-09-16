import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Quiz1756188031247 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                          await queryRunner.createTable(new Table({
                                    name: 'quiz',
                                    columns: [{
                                        name: 'id',
                                        type: 'int',
                                        isPrimary: true,
                                        isGenerated: true,
                                        generationStrategy: 'increment'
                                    },
                                    {
                                        name: 'nama_quiz',
                                        type: 'varchar'
                                    },
                                    {
                                        name: 'mingguId',
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
                            await queryRunner.createForeignKey('quiz', new TableForeignKey({
                                    columnNames: ['mingguId'],
                                    referencedTableName: 'minggu',
                                    referencedColumnNames: ['id'],
                                                onDelete: "CASCADE",
                                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                  const table = await queryRunner.getTable('quiz');
  if (!table) return;

  const mingguFk = table.foreignKeys.find(fk => fk.columnNames.includes('mingguId'));

  if (mingguFk) {
    await queryRunner.dropForeignKey('quiz', mingguFk);
  }

        await queryRunner.dropTable('quiz');
    }

}
