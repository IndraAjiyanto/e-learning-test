import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class KelasUser1753676121681 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'kelas_user',
            columns: [
                {
                    name: 'userId',
                    type: 'int'
                },
                {
                    name: 'kelasId',
                    type: 'int'
                }
            ]
        }))

        await queryRunner.createForeignKey('kelas_user', new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

        await queryRunner.createForeignKey('kelas_user', new TableForeignKey({
            columnNames: ['kelasId'],
            referencedTableName: 'kelass',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

    }

public async down(queryRunner: QueryRunner): Promise<void> {
  const table = await queryRunner.getTable('kelas_user');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (userFk) {
    await queryRunner.dropForeignKey('kelas_user', userFk);
  }

  if (kelasFk) {
    await queryRunner.dropForeignKey('kelas_user', kelasFk);
  }

  await queryRunner.dropTable('kelas_user');
}

}
