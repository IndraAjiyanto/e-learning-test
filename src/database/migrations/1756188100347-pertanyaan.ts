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
                                name: 'pertemuanId',
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
                            columnNames: ['pertemuanId'],
                            referencedTableName: 'pertemuan',
                            referencedColumnNames: ['id'],
                            onDelete: "CASCADE",
                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                  const table = await queryRunner.getTable('pertanyaan');
  if (!table) return;

  const pertemuanFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertemuanId'));

  if (pertemuanFk) {
    await queryRunner.dropForeignKey('pertanyaan', pertemuanFk);
  }


  await queryRunner.dropTable('pertanyaan');
    }

}
