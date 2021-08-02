import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTravellingDataTable1627859864022 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createTable(new Table({
      name: "TravellingData",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "originPlanetId",
          type: "varchar",
          isNullable: false
        },
        {
          name: "destinationPlanetId",
          type: "varchar",
          isNullable: false
        },
        {
          name: "fuelConsumption",
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
      ],
      indices: [
        {
          columnNames: ["originPlanetId", "destinationPlanetId"],
          isUnique: true
        }
      ]
    }));
  }

  public async down(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.dropTable("TravellingDataTable");
  }

}
