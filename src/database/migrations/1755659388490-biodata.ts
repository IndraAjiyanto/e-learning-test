import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Biodata1755659388490 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'biodata',
            columns: [{
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment'
            },{
                name: 'nama_lengkap',
                type: 'varchar'
            },{
                name: 'no',
                type: 'varchar'
            },{
                name: 'jenis_kelamin',
                type: 'enum',
                enum: ['Laki laki', 'Perempuan'],
            },{
                name: 'kota',
                type: 'varchar'
            },{
                name: 'pendidikan',
                type: 'enum',
                enum: ['SMP/Sederajat', 'SMA/SMK/Sederajat', 'Diploma(D3/D4)', 'Sarjana(S1)'],
            },{
                name: 'program_studi',
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

                await queryRunner.createForeignKey('biodata', new TableForeignKey({
                    columnNames: ['userId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: "CASCADE",
                }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("biodata");
      if (!table) return;
  const kelasFk = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));

    if (kelasFk) {
      await queryRunner.dropForeignKey("biodata", kelasFk);
    }
    await queryRunner.dropTable("biodata");
    }

}
