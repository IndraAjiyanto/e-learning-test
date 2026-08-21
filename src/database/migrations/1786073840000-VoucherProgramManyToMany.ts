import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  Table,
  TableForeignKey,
} from 'typeorm';

export class VoucherProgramManyToMany1786073840000 implements MigrationInterface {
  name = 'VoucherProgramManyToMany1786073840000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Hapus FK constraint voucherId dari tabel course (jika ada)
    const courseTable = await queryRunner.getTable('course');
    const voucherFk = courseTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('voucherId') !== -1,
    );

    if (voucherFk) {
      await queryRunner.dropForeignKey('course', voucherFk);
    }

    // 2. Hapus kolom voucherId dari tabel course
    const voucherColumn = courseTable?.findColumnByName('voucherId');
    if (voucherColumn) {
      await queryRunner.dropColumn('course', 'voucherId');
    }

    // 3. Buat tabel junction voucher_programs
    await queryRunner.createTable(
      new Table({
        name: 'voucher_programs',
        columns: [
          {
            name: 'voucherId',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'courseId',
            type: 'int',
            isPrimary: true,
          },
        ],
      }),
      true, // ifNotExists
    );

    const voucherProgramsTable = await queryRunner.getTable('voucher_programs');

    // 4. Tambahkan FK ke tabel voucher
    const voucherProgramVoucherFk = voucherProgramsTable?.foreignKeys.find(
      (fk) =>
        fk.columnNames.length === 1 &&
        fk.columnNames[0] === 'voucherId' &&
        fk.referencedTableName === 'voucher',
    );
    if (!voucherProgramVoucherFk) {
      await queryRunner.createForeignKey(
        'voucher_programs',
        new TableForeignKey({
          columnNames: ['voucherId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'voucher',
          onDelete: 'CASCADE',
        }),
      );
    }

    // 5. Tambahkan FK ke tabel course
    const refreshedVoucherProgramsTable =
      await queryRunner.getTable('voucher_programs');
    const voucherProgramCourseFk =
      refreshedVoucherProgramsTable?.foreignKeys.find(
        (fk) =>
          fk.columnNames.length === 1 &&
          fk.columnNames[0] === 'courseId' &&
          fk.referencedTableName === 'course',
      );
    if (!voucherProgramCourseFk) {
      await queryRunner.createForeignKey(
        'voucher_programs',
        new TableForeignKey({
          columnNames: ['courseId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'course',
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: hapus tabel junction dan restore FK lama
    const voucherProgramsTable = await queryRunner.getTable('voucher_programs');
    if (voucherProgramsTable) {
      await queryRunner.dropTable('voucher_programs', true);
    }

    // Restore kolom voucherId di course
    const courseTable = await queryRunner.getTable('course');
    const voucherIdColumn = courseTable?.findColumnByName('voucherId');
    if (!voucherIdColumn) {
      await queryRunner.addColumn(
        'course',
        new TableColumn({
          name: 'voucherId',
          type: 'int',
          isNullable: true,
        }),
      );
    }

    // Restore FK
    const refreshedCourseTable = await queryRunner.getTable('course');
    const courseVoucherFk = refreshedCourseTable?.foreignKeys.find(
      (fk) =>
        fk.columnNames.length === 1 &&
        fk.columnNames[0] === 'voucherId' &&
        fk.referencedTableName === 'voucher',
    );
    if (!courseVoucherFk) {
      await queryRunner.createForeignKey(
        'course',
        new TableForeignKey({
          columnNames: ['voucherId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'voucher',
          onDelete: 'SET NULL',
        }),
      );
    }
  }
}
