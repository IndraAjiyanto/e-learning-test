import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnTimeStartToCourse1786407684595 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.addColumn(
            "course",
            new TableColumn({
                name: "time_start",
                type: "time",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "course",
            new TableColumn({
                name: "time_end",
                type: "time",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("course", "time_end");
        await queryRunner.dropColumn("course", "time_start");
    }

}
