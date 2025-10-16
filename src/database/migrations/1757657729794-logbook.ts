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
                         },
                                                                                                 {
                    name: 'proses',
                    type: 'enum',
                    enum: ['acc', 'proces', 'rejected']
                },{
                             name: 'kendala',
                             type: 'varchar'
                         },
                         {
                            name: 'dokumentasi',
                            type: 'varchar'
                        },{
                            name: 'dokumentasi_lain',
                            type: 'varchar'
                        },{
                             name: 'userId',
                             type: 'int'
                         },{
                            name: 'pertemuanId',
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
                                                                         columnNames: ['pertemuanId'],
                                                                         referencedTableName: 'pertemuan',
                                                                         referencedColumnNames: ['id'],
                                                                         onDelete: "CASCADE",
                                                                     }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                                                const table = await queryRunner.getTable('logbook');
  if (!table) return;

  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
  const pertemuanFk = table.foreignKeys.find(fk => fk.columnNames.includes('pertemuanId'));

  if (userFk) {
    await queryRunner.dropForeignKey('logbook', userFk);
  }
    if (pertemuanFk) {
    await queryRunner.dropForeignKey('logbook', pertemuanFk);
  }


  await queryRunner.dropTable('logbook');
    }

}
