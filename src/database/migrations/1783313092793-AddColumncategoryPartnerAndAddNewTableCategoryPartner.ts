import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AddColumncategoryPartnerAndAddNewTableCategoryPartner1783313092793 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         // Membuat tabel category_partner
    await queryRunner.createTable(
      new Table({
        name: "category_partner",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "category",
            type: "varchar",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    );

    // Menambahkan kolom categoryPartnerId ke tabel partner
    await queryRunner.addColumn(
      "partner",
      new TableColumn({
        name: "categoryPartnerId",
        type: "int",
        isNullable: false,
      }),
    );

    // Menambahkan foreign key
    await queryRunner.createForeignKey(
      "partner",
      new TableForeignKey({
        columnNames: ["categoryPartnerId"],
        referencedTableName: "category_partner",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    );
  
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         const table = await queryRunner.getTable("partner");

    const foreignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes("categoryPartnerId"),
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey("partner", foreignKey);
    }

    await queryRunner.dropColumn("partner", "categoryPartnerId");

    await queryRunner.dropTable("category_partner");
  }

    

}
