import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTypeToDrawTypeColumnName1726014996667 implements MigrationInterface {
    name = 'ChangeTypeToDrawTypeColumnName1726014996667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participants\` CHANGE \`type\` \`draw_type\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`participants\` DROP COLUMN \`draw_type\``);
        await queryRunner.query(`ALTER TABLE \`participants\` ADD \`draw_type\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participants\` DROP COLUMN \`draw_type\``);
        await queryRunner.query(`ALTER TABLE \`participants\` ADD \`draw_type\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`participants\` CHANGE \`draw_type\` \`type\` varchar(255) NOT NULL`);
    }

}
