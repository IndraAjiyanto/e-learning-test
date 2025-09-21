import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Portfolio1755662755475 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'portfolio',
            columns: [{
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment'
            },
            {
                name: 'gambar',
                type: 'jsonb'
            },
            {
                name: 'judul',
                type: 'varchar'
            },
            {
                name: 'deskripsi',
                type: 'varchar'
            },
                        {
                name: 'teknologi',
                type: 'jsonb',
            },
            {
                name: 'userId',
                type: 'int'
            },{
                name: 'kelasId',
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

        await queryRunner.createForeignKey('portfolio', new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey('portfolio', new TableForeignKey({
            columnNames: ['kelasId'],
            referencedTableName: 'kelas',
            referencedColumnNames: ['id'],
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                  const table = await queryRunner.getTable('portfolio');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (userFk) {
    await queryRunner.dropForeignKey('portfolio', userFk);
  }

  if (kelasFk) {
    await queryRunner.dropForeignKey('portfolio', kelasFk);
  }

  await queryRunner.dropTable('portfolio');
    }

}
