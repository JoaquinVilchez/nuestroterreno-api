import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLotsTable1722467693935 implements MigrationInterface {
  name = 'AddLotsTable1722467693935';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`lots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`group\` int NOT NULL, \`draw_type\` varchar(100) NOT NULL, \`denomination\` varchar(100) NOT NULL, \`image\` varchar(255) NOT NULL DEFAULT 'no-image.jpg', \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7b7781e695f4fab2b37c521285\` (\`denomination\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_7b7781e695f4fab2b37c521285\` ON \`lots\``,
    );
    await queryRunner.query(`DROP TABLE \`lots\``);
  }
}
