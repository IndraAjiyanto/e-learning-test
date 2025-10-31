import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class PertanyaanKelas1759226651583 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.createTable(new Table({
                                                          name: 'pertanyaan_kelas',
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

                                                                                                                                  await queryRunner.createForeignKey('pertanyaan_kelas', new TableForeignKey({
                                                                                                                                      columnNames: ['kelasId'],
                                                                                                                                      referencedTableName: 'kelas',
                                                                                                                                      referencedColumnNames: ['id'],
                                                                                                                                      onDelete: "CASCADE",
                                                                                                                                  }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
