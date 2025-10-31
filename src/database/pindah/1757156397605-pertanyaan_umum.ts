import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class PertanyaanUmum1757156397605 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.createTable(new Table({
                                                   name: 'pertanyaan_umum',
                                                   columns: [{
                                                       name: 'id',
                                                       type: 'int',
                                                       isPrimary: true,
                                                       isGenerated: true,
                                                       generationStrategy: 'increment'
                                                   },{
                                                       name: 'pertanyaan',
                                                       type: 'varchar'
                                                   },
                                                   {
                                                       name: 'jawaban',
                                                       type: 'varchar'
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                                                                const table = await queryRunner.getTable('pertanyaan_umum');
  if (!table) return;


  await queryRunner.dropTable('pertanyaan_umum');
    }

}
