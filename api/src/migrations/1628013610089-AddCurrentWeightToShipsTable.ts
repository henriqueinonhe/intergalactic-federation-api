import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddCurrentWeightToShipsTable1628013610089 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.addColumn("Ships", new TableColumn({
      name: "currentWeight",
      type: "int",
      isNullable: false
    }));

    await queryRunner.query(`
      UPDATE Ships
      SET currentWeight = 0
      WHERE 1 = 1
    `);
  }

  public async down(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.dropColumn("Ships", "currentWeight");
  }
}
