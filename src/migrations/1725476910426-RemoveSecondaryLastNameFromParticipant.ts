import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSecondaryLastNameFromParticipant1725476910426 implements MigrationInterface {
    name = 'RemoveSecondaryLastNameFromParticipant1725476910426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participants\` DROP COLUMN \`secondary_last_name\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participants\` ADD \`secondary_last_name\` varchar(50) NOT NULL`);
    }

}
