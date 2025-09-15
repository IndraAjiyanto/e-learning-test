import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Nilai1757911553247 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                  await queryRunner.createTable(new Table({
                            name: 'nilai',
                            columns: [{
                                name: 'id',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: 'increment'
                            },
                            {
                                name: 'nilai',
                                type: 'int'
                            },
                            {
                                name: 'userId',
                                type: 'int'
                            },
                            {
                                name: 'quizId',
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
                    await queryRunner.createForeignKey('nilai', new TableForeignKey({
                            columnNames: ['userId'],
                            referencedTableName: 'user',
                            referencedColumnNames: ['id'],
                                        onDelete: "CASCADE",
                        }));
                    await queryRunner.createForeignKey('nilai', new TableForeignKey({
                            columnNames: ['quizId'],
                            referencedTableName: 'quiz',
                            referencedColumnNames: ['id'],
                                        onDelete: "CASCADE",
                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                            const table = await queryRunner.getTable('nilai');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const quizFk = table.foreignKeys.find(fk => fk.columnNames.includes('quizId'));

  if (userFk) {
    await queryRunner.dropForeignKey('nilai', userFk);
  }
  if (quizFk) {
    await queryRunner.dropForeignKey('nilai', quizFk);
  }

        await queryRunner.dropTable('nilai');
    
    }

}
