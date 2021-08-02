import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class CreateForeignKeysConstraints1627873067343 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createForeignKeys("Pilots", [
      new TableForeignKey({
        columnNames: ["currentLocationId"],
        referencedTableName: "Planets",
        referencedColumnNames: ["id"]
      }),
      new TableForeignKey({
        columnNames: ["shipId"],
        referencedTableName: "Ships",
        referencedColumnNames: ["id"]
      })
    ]);

    await queryRunner.createForeignKeys("Contracts", [
      new TableForeignKey({
        columnNames: ["originPlanetId"],
        referencedTableName: "Planets",
        referencedColumnNames: ["id"]
      }),
      new TableForeignKey({
        columnNames: ["destinationPlanetId"],
        referencedTableName: "Planets",
        referencedColumnNames: ["id"]
      }),
      new TableForeignKey({
        columnNames: ["contracteeId"],
        referencedTableName: "Pilots",
        referencedColumnNames: ["id"]
      })
    ]);

    await queryRunner.createForeignKeys("Resources", [
      new TableForeignKey({
        columnNames: ["contractId"],
        referencedTableName: "Contracts",
        referencedColumnNames: ["Id"]
      })
    ]);

    await queryRunner.createForeignKeys("Refills", [
      new TableForeignKey({
        columnNames: ["pilotId"],
        referencedTableName: "Pilots",
        referencedColumnNames: ["id"]
      })
    ]);

    await queryRunner.createForeignKeys("TravellingData", [
      new TableForeignKey({
        columnNames: ["originPlanetId"],
        referencedTableName: "Planets",
        referencedColumnNames: ["id"]
      }),
      new TableForeignKey({
        columnNames: ["destinationPlanetId"],
        referencedTableName: "Planets",
        referencedColumnNames: ["id"]
      })
    ]);
  }

  public async down(queryRunner : QueryRunner) : Promise<void> {
    const [
      travellingDataTable,
      refillsTable,
      resourcesTable,
      contractsTable,
      pilotsTable
    ] = await queryRunner.getTables([
      "TravellingData",
      "Refills",
      "Resources",
      "Contracts",
      "Pilots"
    ]);

    await queryRunner.dropForeignKeys(travellingDataTable, travellingDataTable.foreignKeys);
    await queryRunner.dropForeignKeys(refillsTable, refillsTable.foreignKeys);
    await queryRunner.dropForeignKeys(resourcesTable, resourcesTable.foreignKeys);
    await queryRunner.dropForeignKeys(contractsTable, contractsTable.foreignKeys);
    await queryRunner.dropForeignKeys(pilotsTable, pilotsTable.foreignKeys);
  }

}
