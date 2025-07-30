import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class KelasUser1753676121681 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'user_kelas_kelas',
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

        await queryRunner.createForeignKey('user_kelas_kelas', new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

        await queryRunner.createForeignKey('user_kelas_kelas', new TableForeignKey({
            columnNames: ['kelasId'],
            referencedTableName: 'kelas',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

    }

public async down(queryRunner: QueryRunner): Promise<void> {
  const table = await queryRunner.getTable('user_kelas_kelas');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (userFk) {
    await queryRunner.dropForeignKey('user_kelas_kelas', userFk);
  }

  if (kelasFk) {
    await queryRunner.dropForeignKey('user_kelas_kelas', kelasFk);
  }

  await queryRunner.dropTable('user_kelas_kelas');
}

}
