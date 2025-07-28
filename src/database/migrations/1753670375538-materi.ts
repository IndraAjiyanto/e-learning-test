import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Materi1753670375538 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'materis',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'pdf',
                    type: 'varchar'
                },
                {
                    name: 'video',
                    type: 'varchar'
                },
                {
                    name: 'ppt',
                    type: 'varchar'
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

        await queryRunner.createForeignKey('materis', new TableForeignKey({
            columnNames: ['kelasId'],
            referencedTableName: 'kelass',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                  const table = await queryRunner.getTable('materis');
  if (!table) return;

  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (kelasFk) {
    await queryRunner.dropForeignKey('materis', kelasFk);
  }

  await queryRunner.dropTable('materis');
    }

}
