import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex, TableInheritance } from "typeorm";

export class Kelas1753670172780 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'kelas',
            columns: [{
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment'
            },
            {
                name: 'nama_kelas',
                type: 'varchar',
            },
            {
                name: 'harga',
                type: 'int'
            },
            {
                name: 'informasi_kelas',
                type: 'varchar'
            },
            {
                name: 'launch',
                type: 'boolean',
                default: false
            },
            {
                name: 'teknologi',
                type: 'varchar'
            },
            {
                name: 'target_pembelajaran',
                type: 'varchar'
            },
            {
                name: 'deskripsi',
                type: 'varchar'
            },
            {
                name: 'gambar',
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
    await queryRunner.createForeignKey('kelas', new TableForeignKey({
            columnNames: ['kategoriId'],
            referencedTableName: 'kategori',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                  const table = await queryRunner.getTable('kelass');
  if (!table) return;

  const kategoriFk = table.foreignKeys.find(fk => fk.columnNames.includes('kategoriId'));

  if (kategoriFk) {
    await queryRunner.dropForeignKey('kelass', kategoriFk);
  }

        await queryRunner.dropTable('kelass');
        
    }

}
