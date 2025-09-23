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
                type: 'int',
                    isNullable: true
            },
            {
                name: 'launch',
                type: 'boolean',
                default: false
            },
            {
                name: 'teknologi',
                type: 'jsonb',
            },
            {
                name: 'target_pembelajaran',
                type: 'jsonb',
            },
            {
                name: 'materi',
                type: 'jsonb',
            },
            {
                name: 'deskripsi',
                type: 'varchar'
            },
                            {
                    name: 'metode',
                    type: 'enum',
                    enum: ['online', 'offline']
                },
                {
                    name: 'kriteria',
                    type: 'jsonb'
                },
                {
                    name: 'promo',
                    type: 'int',
                    isNullable: true
                },
                {
                    name: 'kuota',
                    type: 'int',
                    isNullable: true
                },
                                                                        {
                    name: 'proses',
                    type: 'enum',
                    enum: ['acc', 'proces', 'rejected']
                },
            {
                name: 'gambar',
                type: 'varchar'
            },
                            {
                    name: 'lokasi',
                    type: 'varchar'
                },
            {
                name: 'kategoriId',
                type: 'int'
            },
            {
                name: 'jenis_kelasId',
                type: 'int',
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
    await queryRunner.createForeignKey('kelas', new TableForeignKey({
            columnNames: ['jenis_kelasId'],
            referencedTableName: 'jenis_kelas',
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
