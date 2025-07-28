import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Absen1753687926830 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'absens',
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
        
        await queryRunner.createForeignKey('absens', new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }))

        await queryRunner.createForeignKey('absens', new TableForeignKey({
            columnNames: ['pertemuanId'],
            referencedTableName: 'pertemuans',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
          const table = await queryRunner.getTable('absens');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertemuanId'));

  if (userFk) {
    await queryRunner.dropForeignKey('absens', userFk);
  }

  if (kelasFk) {
    await queryRunner.dropForeignKey('absens', kelasFk);
  }

  await queryRunner.dropTable('absens');
    }

}
