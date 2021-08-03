import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddIdToRefillsTable1628024052784 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.addColumn("Refills", new TableColumn({
      name: "id",
      type: "varchar",
      isPrimary: true
    }));
  }

  public async down(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.dropColumn("Refills", "id");
  }

}
