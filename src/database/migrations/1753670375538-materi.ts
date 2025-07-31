import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Materi1753670375538 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'materi',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'file',
                    type: 'varchar'
                },
                {
                    name: 'jenis_file',
                    type: 'enum',
                    enum: ['video', 'pdf', 'ppt']
                },
                {
                    name: 'kelasId',
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

        await queryRunner.createForeignKey('materi', new TableForeignKey({
            columnNames: ['kelasId'],
            referencedTableName: 'kelas',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                  const table = await queryRunner.getTable('materi');
  if (!table) return;

  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (kelasFk) {
    await queryRunner.dropForeignKey('materi', kelasFk);
  }

  await queryRunner.dropTable('materi');
    }

}
