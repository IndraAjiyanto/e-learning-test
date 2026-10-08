import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCertificateNumber1791300000000 implements MigrationInterface {
    name = 'AddCertificateNumber1791300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('certificates'))) {
            await queryRunner.query(`
        CREATE TABLE "certificates" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "certificate_file" character varying,
          "no_certificate" character varying,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "courseId" uuid NOT NULL,
          "userId" uuid NOT NULL,
          CONSTRAINT "PK_certificates" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_certificates_user_course" UNIQUE ("userId", "courseId")
        )
      `);
            await queryRunner.query(`
        ALTER TABLE "certificates"
          ADD CONSTRAINT "FK_certificates_course"
          FOREIGN KEY ("courseId") REFERENCES "course"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);
            await queryRunner.query(`
        ALTER TABLE "certificates"
          ADD CONSTRAINT "FK_certificates_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);
            return;
        }

        const table = await queryRunner.getTable('certificates');
        if (table?.findColumnByName('certificate_file')) {
            await queryRunner.query(
                'ALTER TABLE "certificates" ALTER COLUMN "certificate_file" DROP NOT NULL',
            );
        }
        if (!table?.findColumnByName('no_certificate')) {
            await queryRunner.addColumn(
                'certificates',
                new TableColumn({
                    name: 'no_certificate',
                    type: 'varchar',
                    isNullable: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('certificates'))) return;
        const table = await queryRunner.getTable('certificates');
        if (table?.findColumnByName('no_certificate')) {
            await queryRunner.dropColumn('certificates', 'no_certificate');
        }
        await queryRunner.query(
            'ALTER TABLE "certificates" ALTER COLUMN "certificate_file" SET NOT NULL',
        );
    }
}