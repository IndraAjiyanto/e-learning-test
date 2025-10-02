import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AlurKelas1759385465096 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
                                                                  name: 'alur_kelas',
                                                                  columns: [{
                                                                      name: 'id',
                                                                      type: 'int',
                                                                      isPrimary: true,
                                                                      isGenerated: true,
                                                                      generationStrategy: 'increment'
                                                                  },{
                                                                      name: 'alur_ke',
                                                                      type: 'int'
                                                                  },
                                                                  {
                                                                      name: 'judul',
                                                                      type: 'varchar'
                                                                  },
                                                                  {
                                                                    name: 'isi',
                                                                    type: 'varchar'
                                                                  },
                                                                  {
                                                                    name: 'kategoriId',
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
                                                              await queryRunner.createForeignKey('alur_kelas', new TableForeignKey({
                                                                                                                                                                                                    columnNames: ['kategoriId'],
                                                                                                                                                                                                    referencedTableName: 'kategori',
                                                                                                                                                                                                    referencedColumnNames: ['id'],
                                                                                                                                                                                                    onDelete: "CASCADE",
                                                                                                                                                                                                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
