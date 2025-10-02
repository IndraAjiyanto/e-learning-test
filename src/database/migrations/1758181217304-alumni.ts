import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Alumni1758181217304 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                 await queryRunner.createTable(new Table({
                                                           name: 'alumni',
                                                           columns: [{
                                                               name: 'id',
                                                               type: 'int',
                                                               isPrimary: true,
                                                               isGenerated: true,
                                                               generationStrategy: 'increment'
                                                           },{
                                                               name: 'profile',
                                                               type: 'varchar'
                                                           },
                                                           {
                                                               name: 'nama',
                                                               type: 'varchar'
                                                           },
                                                           {
                                                               name: 'pesan',
                                                               type: 'varchar'
                                                           },
                                                           {
                                                               name: 'alumni',
                                                               type: 'varchar'
                                                           },
                                                           {
                                                               name: 'posisi_sekarang',
                                                               type: 'varchar'
                                                           },
                                                           {
                                                               name: 'kelas',
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
        
    }

}
