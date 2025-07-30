import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Pertemuan1753670381181 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table ({
            name: 'pertemuan',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'topik',
                    type: 'varchar'
                },
                {
                    name: 'tanggal',
                    type: 'date'
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

        await queryRunner.createForeignKey('pertemuan', new TableForeignKey({
            columnNames: ['kelasId'],
            referencedTableName: 'kelas',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
          const table = await queryRunner.getTable('pertemuans');
  if (!table) return;

  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (kelasFk) {
    await queryRunner.dropForeignKey('pertemuans', kelasFk);
  }

  await queryRunner.dropTable('pertemuans');
    }

}
