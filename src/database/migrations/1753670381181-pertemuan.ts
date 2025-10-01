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
                    name: 'pertemuan_ke',
                    type: 'int'
                },
                {
                    name: 'topik',
                    type: 'varchar'
                },
                {
                    name: 'lokasi',
                    type: 'varchar'
                },
                {
                    name: 'tanggal',
                    type: 'date'
                },
                {
                    name: 'waktu_awal',
                    type: 'time'
                },
                {
                    name: 'akhir',
                    type: 'boolean',
                    default: false
                },
                {
                    name: 'waktu_akhir',
                    type: 'time'
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

        await queryRunner.createForeignKey('pertemuan', new TableForeignKey({
            columnNames: ['mingguId'],
            referencedTableName: 'minggu',
            referencedColumnNames: ['id'],
            onDelete: "CASCADE",
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
          const table = await queryRunner.getTable('pertemuan');
  if (!table) return;

  const mingguFk = table.foreignKeys.find(fk => fk.columnNames.includes('mingguId'));

  if (mingguFk) {
    await queryRunner.dropForeignKey('pertemuan', mingguFk);
  }

  await queryRunner.dropTable('pertemuan');
    }

}
