import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Pembayaran1756188094636 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.createTable(new Table({
                    name: 'pembayaran',
                    columns: [{
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },{
                        name: 'file',
                        type: 'varchar',
                        isNullable: true
                    },
                {
                    name: 'proses',
                    type: 'enum',
                    enum: ['acc', 'proces', 'rejected'],
                    default: `'rejected'`,
                },{
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
        
                await queryRunner.createForeignKey('pembayaran', new TableForeignKey({
                    columnNames: ['userId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'RESTRICT',
                }));
        
                await queryRunner.createForeignKey('pembayaran', new TableForeignKey({
                    columnNames: ['kelasId'],
                    referencedTableName: 'kelas',
                    referencedColumnNames: ['id'],
                    onDelete: 'RESTRICT',
                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                          const table = await queryRunner.getTable('pembayaran');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (userFk) {
    await queryRunner.dropForeignKey('pembayaran', userFk);
  }

  if (kelasFk) {
    await queryRunner.dropForeignKey('pembayaran', kelasFk);
  }

  await queryRunner.dropTable('pembayaran');
    }

}
