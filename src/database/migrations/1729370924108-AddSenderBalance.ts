import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSenderBalance1729370924108 implements MigrationInterface {
    name = 'AddSenderBalance1729370924108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" ADD "balanceBefore" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD "balanceAfter" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "balanceAfter"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "balanceBefore"`);
    }

}
