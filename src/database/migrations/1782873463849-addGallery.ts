import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddGallery1782873463849 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
          console.log("Creating gallery table...");
          await queryRunner.createTable(
      new Table({
        name: "gallery",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "file_path",
            type: "varchar",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "kategori_id",
            type: "int",
            isNullable: true,
          },
        ],
      }),
      true
    );

    const table = await queryRunner.getTable("gallery");
    const foreignKeyExists = table?.foreignKeys.some(
      (fk) => fk.columnNames.indexOf("kategori_id") !== -1
    );

    if (!foreignKeyExists) {
      await queryRunner.createForeignKey(
        "gallery",
        new TableForeignKey({
          columnNames: ["kategori_id"],
          referencedTableName: "kategori",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        })
      );
    } else {
      console.log("Foreign key for gallery already exists, skipping...");
    }
  }

    

    public async down(queryRunner: QueryRunner): Promise<void> {
         const table = await queryRunner.getTable("gallery");
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("kategori_id") !== -1
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey("gallery", foreignKey);
    }

    await queryRunner.dropTable("gallery");
  }
    

}
