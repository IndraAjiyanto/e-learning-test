import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Absen1753687926830 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'absen',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['hadir', 'izin', 'sakit', 'alfa', 'tidak ada keterangan'],
                    default: `'tidak ada keterangan'`,
                },
                {
                    name: 'waktu_absen',
                    type: 'date'
                },
                {
                    name: 'keterangan',
                    type: 'varchar'
                },
                {
                    name: 'userId',
                    type: 'int'
                },
                {
                    name: 'pertemuanId',
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
        
        await queryRunner.createForeignKey('absen', new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
        }))

        await queryRunner.createForeignKey('absen', new TableForeignKey({
            columnNames: ['pertemuanId'],
            referencedTableName: 'pertemuan',
            referencedColumnNames: ['id'],
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
          const table = await queryRunner.getTable('absen');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertemuanId'));

  if (userFk) {
    await queryRunner.dropForeignKey('absen', userFk);
  }

  if (kelasFk) {
    await queryRunner.dropForeignKey('absen', kelasFk);
  }

  await queryRunner.dropTable('absen');
    }

}
