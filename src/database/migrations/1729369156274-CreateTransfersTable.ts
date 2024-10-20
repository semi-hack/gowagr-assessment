import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransfersTable1729369156274 implements MigrationInterface {
    name = 'CreateTransfersTable1729369156274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transfers" ("id" SERIAL NOT NULL, "amount" numeric NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid, "receiverId" uuid, CONSTRAINT "PK_f712e908b465e0085b4408cabc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "FK_d6385758cb5394ac2fdbfe118a3" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "FK_6d8e1008c743bac0b9c92661512" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_6d8e1008c743bac0b9c92661512"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_d6385758cb5394ac2fdbfe118a3"`);
        await queryRunner.query(`DROP TABLE "transfers"`);
    }

}
