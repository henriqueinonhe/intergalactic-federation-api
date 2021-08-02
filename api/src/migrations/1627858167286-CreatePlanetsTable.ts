import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreatePlanetsTable1627858167286 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createTable(new Table({
      name: "Planets",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "name",
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
    await queryRunner.dropTable("Planets");
  }

}
