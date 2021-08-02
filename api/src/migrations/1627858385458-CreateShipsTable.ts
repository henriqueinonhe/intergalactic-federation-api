import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateShipsTable1627858385458 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createTable(new Table({
      name: "Ships",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "fuelCapacity",
          type: "int",
          isNullable: false
        },
        {
          name: "fuelLevel",
          type: "int",
          isNullable: false
        },
        {
          name: "weightCapacity",
          type: "int",
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
    await queryRunner.dropTable("Ships");
  }

}
