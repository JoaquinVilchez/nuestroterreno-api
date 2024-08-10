import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderNumberAndResultTypeInResultsEntity1723216568786 implements MigrationInterface {
    name = 'AddOrderNumberAndResultTypeInResultsEntity1723216568786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_419028049a18ae3c44c5687890\` ON \`results\``);
        await queryRunner.query(`DROP INDEX \`IDX_579c601d8a54572f6979cbc65d\` ON \`results\``);
        await queryRunner.query(`ALTER TABLE \`results\` ADD \`order_number\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`results\` ADD \`result_type\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`results\` DROP COLUMN \`result_type\``);
        await queryRunner.query(`ALTER TABLE \`results\` DROP COLUMN \`order_number\``);
        await queryRunner.query(`CREATE INDEX \`IDX_579c601d8a54572f6979cbc65d\` ON \`results\` (\`draw_type\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_419028049a18ae3c44c5687890\` ON \`results\` (\`group\`)`);
    }

}
