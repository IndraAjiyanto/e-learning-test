import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class BiodataMentor1757156032374 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
               await queryRunner.createTable(new Table({
                   name: 'biodata_mentor',
                   columns: [{
                       name: 'id',
                       type: 'int',
                       isPrimary: true,
                       isGenerated: true,
                       generationStrategy: 'increment'
                   },{
                       name: 'role',
                       type: 'varchar'
                   },{
                       name: 'userId',
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
       
                       await queryRunner.createForeignKey('biodata_mentor', new TableForeignKey({
                           columnNames: ['userId'],
                           referencedTableName: 'user',
                           referencedColumnNames: ['id'],
                           onDelete: 'RESTRICT',
                       }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
            const table = await queryRunner.getTable("biodata_mentor");
      if (!table) return;
  const userFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));

    if (userFk) {
      await queryRunner.dropForeignKey("biodata_mentor", userFk);
    }
    await queryRunner.dropTable("biodata_mentor");
    }

}
