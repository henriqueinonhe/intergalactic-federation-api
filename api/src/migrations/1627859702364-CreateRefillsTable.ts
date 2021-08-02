import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateRefillsTable1627859702364 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createTable(new Table({
      name: "Refills",
      columns: [
        {
          name: "amount",
          type: "integer",
          isNullable: false
        },
        {
          name: "pilotId",
          type: "varchar",
          isNullable: false
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
    await queryRunner.dropTable("Refills");
  }

}
