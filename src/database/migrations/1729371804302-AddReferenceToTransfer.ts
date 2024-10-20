import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferenceToTransfer1729371804302 implements MigrationInterface {
    name = 'AddReferenceToTransfer1729371804302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" ADD "reference" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "UQ_850ecad1c8031dc94c396c9f18a" UNIQUE ("reference")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "UQ_850ecad1c8031dc94c396c9f18a"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "reference"`);
    }

}
