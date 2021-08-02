import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateResourcesTable1627859447854 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createTable(new Table({
      name: "Resources",
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
          name: "weight",
          type: "int",
          isNullable: false
        },
        {
          name: "contractId",
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
    await queryRunner.dropTable("Resources");
  }

}
