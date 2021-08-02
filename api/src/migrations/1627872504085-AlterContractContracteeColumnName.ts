import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterContractContracteeColumnName1627872504085 implements MigrationInterface {

  public async up(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.renameColumn(
      "Contracts",
      "contractee",
      "contracteeId"
    );
  }

  public async down(queryRunner : QueryRunner) : Promise<void> {
    await queryRunner.renameColumn(
      "Contracts",
      "contracteeId",
      "contractee"
    );
  }

}
