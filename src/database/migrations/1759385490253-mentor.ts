import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Mentor1759385490253 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                        await queryRunner.createTable(new Table({
                                                                  name: 'mentor',
                                                                  columns: [{
                                                                      name: 'id',
                                                                      type: 'int',
                                                                      isPrimary: true,
                                                                      isGenerated: true,
                                                                      generationStrategy: 'increment'
                                                                  },{
                                                                      name: 'nama',
                                                                      type: 'varchar'
                                                                  },
                                                                  {
                                                                      name: 'posisi',
                                                                      type: 'varchar'
                                                                  },
                                                                  {
                                                                    name: 'linkedin',
                                                                    type: 'varchar'
                                                                  },
                                                                              {
                name: 'teknologi',
                type: 'jsonb',
            },
                                                                  {
                                                                    name: 'github',
                                                                    type: 'varchar'
                                                                  },
                                                                  {
                                                                    name: 'profile',
                                                                    type: 'varchar'                                                                    
                                                                  },
                                                                  {
                                                                    name: 'deskripsi',
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
        
                                                                                                                                          await queryRunner.createForeignKey('mentor', new TableForeignKey({
                                                                                                                                              columnNames: ['kelasId'],
                                                                                                                                              referencedTableName: 'kelas',
                                                                                                                                              referencedColumnNames: ['id'],
                                                                                                                                              onDelete: "CASCADE",
                                                                                                                                          }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
