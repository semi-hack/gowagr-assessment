import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTransferIdToUUID1729437881641 implements MigrationInterface {
    name = 'ChangeTransferIdToUUID1729437881641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "PK_f712e908b465e0085b4408cabc3"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "PK_f712e908b465e0085b4408cabc3" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "PK_f712e908b465e0085b4408cabc3"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "PK_f712e908b465e0085b4408cabc3" PRIMARY KEY ("id")`);
    }

}
