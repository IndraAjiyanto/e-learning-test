import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Logbook1757657729794 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                     await queryRunner.createTable(new Table({
                         name: 'logbook',
                         columns: [{
                             name: 'id',
                             type: 'int',
                             isPrimary: true,
                             isGenerated: true,
                             generationStrategy: 'increment'
                         },{
                             name: 'kegiatan',
                             type: 'varchar'
                         },{
                             name: 'rincian_kegiatan',
                             type: 'varchar'
                         },{
                             name: 'kendala',
                             type: 'varchar'
                         },
                         {
                            name: 'dokumentasi',
                            type: 'varchar'
                        },{
                             name: 'userId',
                             type: 'int'
                         },{
                            name: 'kelasId',
                            type: 'int'
                         },{
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

                                                                     await queryRunner.createForeignKey('logbook', new TableForeignKey({
                                                                         columnNames: ['userId'],
                                                                         referencedTableName: 'user',
                                                                         referencedColumnNames: ['id'],
                                                                         onDelete: "CASCADE",
                                                                     }));
                                                                     await queryRunner.createForeignKey('logbook', new TableForeignKey({
                                                                         columnNames: ['kelasId'],
                                                                         referencedTableName: 'kelas',
                                                                         referencedColumnNames: ['id'],
                                                                         onDelete: "CASCADE",
                                                                     }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                                                const table = await queryRunner.getTable('logbook');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('kelasId'));

  if (userFk) {
    await queryRunner.dropForeignKey('logbook', userFk);
  }
    if (kelasFk) {
    await queryRunner.dropForeignKey('logbook', kelasFk);
  }


  await queryRunner.dropTable('logbook');
    }

}
