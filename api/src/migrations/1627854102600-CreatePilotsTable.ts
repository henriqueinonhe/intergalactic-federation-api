import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePilotsTable1627854102600 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createTable(new Table({
      name: "Pilots",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "certification",
          type: "varchar",
          isNullable: false,
          isUnique: true
        },
        {
          name: "name",
          type: "varchar",
          isNullable: false
        },
        {
          name: "age",
          type: "integer",
          isNullable: false
        },
        {
          name: "credits",
          type: "decimal",
          precision: 21,
          scale: 4,
          isNullable: false
        },
        {
          name: "currentLocationId",
          type: "varchar",
          isNullable: false
        },
        {
          name: "shipId",
          type: "varchar",
          isNullable: true
        },
        {
          name: "createdAt",
          type: "timestamp",
          default: "now()",
          isNullable: false
        },
        {
          name: "updatedAt",
          type: "timestamp",
          default: "now()",
          isNullable: false
        }
      ]
    }));
  }

  public async down(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.dropTable("Pilots");
  }

}
