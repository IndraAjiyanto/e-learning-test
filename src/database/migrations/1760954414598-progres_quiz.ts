import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ProgresQuiz1760954414598 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                                  await queryRunner.createTable(new Table({
                                            name: 'progres_quiz',
                                            columns: [{
                                                name: 'id',
                                                type: 'int',
                                                isPrimary: true,
                                                isGenerated: true,
                                                generationStrategy: 'increment'
                                            },
                                            {
                                                name: 'quizId',
                                                type: 'int'
                                            },
                                            {
                                                name: 'userId',
                                                type: 'int'
                                            },
                                                                             {
                                                name: 'proses',
                                                type: 'boolean',
                                                default: false
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
                                    await queryRunner.createForeignKey('progres_quiz', new TableForeignKey({
                                            columnNames: ['userId'],
                                            referencedTableName: 'user',
                                            referencedColumnNames: ['id'],
                                                        onDelete: "CASCADE",
                                        }));
                                    await queryRunner.createForeignKey('progres_quiz', new TableForeignKey({
                                            columnNames: ['quizId'],
                                            referencedTableName: 'quiz',
                                            referencedColumnNames: ['id'],
                                                        onDelete: "CASCADE",
                                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
