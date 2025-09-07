import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Komentar1757156385470 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                     await queryRunner.createTable(new Table({
                         name: 'komentar',
                         columns: [{
                             name: 'id',
                             type: 'int',
                             isPrimary: true,
                             isGenerated: true,
                             generationStrategy: 'increment'
                         },{
                             name: 'komentar',
                             type: 'varchar'
                         },{
                             name: 'jawaban_tugasId',
                             type: 'int'
                         },                {
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

                                                                     await queryRunner.createForeignKey('komentar', new TableForeignKey({
                                                                         columnNames: ['jawaban_tugasId'],
                                                                         referencedTableName: 'jawaban_tugas',
                                                                         referencedColumnNames: ['id'],
                                                                         onDelete: 'RESTRICT',
                                                                     }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                                        const table = await queryRunner.getTable('komentar');
  if (!table) return;

  const tugasFk = table.foreignKeys.find(fk => fk.columnNames.includes('jawaban_tugasId'));

  if (tugasFk) {
    await queryRunner.dropForeignKey('komentar', tugasFk);
  }


  await queryRunner.dropTable('komentar');
    }

}
