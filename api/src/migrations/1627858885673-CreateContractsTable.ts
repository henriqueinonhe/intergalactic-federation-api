import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateContractsTable1627858885673 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.createTable(new Table({
      name: "Contracts",
      columns: [
        {
          name: "id",
          type: "varchar",
          isPrimary: true
        },
        {
          name: "description",
          type: "varchar",
          isNullable: false
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
          name: "value",
          type: "decimal",
          precision: 21,
          scale: 4,
          isNullable: false
        },
        {
          name: "contractee",
          type: "varchar",
          isNullable: true
        },
        {
          name: "fulfilledAt",
          type: "timestamp",
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
    await queryRunner.dropTable("Contracts");
  }

}
