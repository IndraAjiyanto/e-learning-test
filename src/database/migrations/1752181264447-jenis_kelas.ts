import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class JenisKelas1752181264447 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
                        await queryRunner.createTable(new Table({
                            name: 'jenis_kelas',
                            columns: [{
                                name: 'id',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: 'increment'
                            },
                            {
                                name: 'nama_jenis_kelas',
                                type: 'varchar',
                            },
                            {
                                name: 'icon',
                                type: 'varchar'
                            },
                            {
                                name: 'deskripsi',
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
