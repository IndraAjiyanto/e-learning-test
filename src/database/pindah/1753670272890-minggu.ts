import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Minggu1753670272890 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
          await queryRunner.createTable(new Table({
                    name: 'minggu',
                    columns: [{
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name: 'keterangan',
                        type: 'varchar',
                    },
                    {
                        name: 'minggu_ke',
                        type: 'int'
                    },
                                    {
                    name: 'akhir',
                    type: 'boolean',
                    default: false
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
            await queryRunner.createForeignKey('minggu', new TableForeignKey({
                    columnNames: ['kelasId'],
                    referencedTableName: 'kelas',
                    referencedColumnNames: ['id'],
                                onDelete: "CASCADE",
                }));
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                          const table = await queryRunner.getTable('minggu');
  if (!table) return;

  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (kelasFk) {
    await queryRunner.dropForeignKey('minggu', kelasFk);
  }

        await queryRunner.dropTable('minggu');
    
    }

}
