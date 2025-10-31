import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class BenefitKelas1759385480783 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.createTable(new Table({
                                                                          name: 'benefit_kelas',
                                                                          columns: [{
                                                                              name: 'id',
                                                                              type: 'int',
                                                                              isPrimary: true,
                                                                              isGenerated: true,
                                                                              generationStrategy: 'increment'
                                                                          },{
                                                                              name: 'benefit',
                                                                              type: 'varchar'
                                                                          },
                                                                          {
                                                                              name: 'icon',
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
                                                                      await queryRunner.createForeignKey('benefit_kelas', new TableForeignKey({
                                                                                                                                                                                                            columnNames: ['kategoriId'],
                                                                                                                                                                                                            referencedTableName: 'kategori',
                                                                                                                                                                                                            referencedColumnNames: ['id'],
                                                                                                                                                                                                            onDelete: "CASCADE",
                                                                                                                                                                                                        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
