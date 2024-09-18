import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleInUserTable1726619747858 implements MigrationInterface {
    name = 'AddRoleInUserTable1726619747858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role\` varchar(50) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    }

}
