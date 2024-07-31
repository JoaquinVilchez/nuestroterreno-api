import { MigrationInterface, QueryRunner } from 'typeorm';

export class BasicParticipantTable1722390980595 implements MigrationInterface {
  name = 'BasicParticipantTable1722390980595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`participants\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ball_number\` int NOT NULL, \`first_name\` varchar(50) NOT NULL, \`last_name\` varchar(50) NOT NULL, \`secondary_last_name\` varchar(50) NOT NULL, \`dni\` varchar(8) NOT NULL, \`group\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_bc61c4f0e97788bd904fb83b1e\` (\`ball_number\`), UNIQUE INDEX \`IDX_13e755cb5b274a2bd087e1c1da\` (\`dni\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_13e755cb5b274a2bd087e1c1da\` ON \`participants\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bc61c4f0e97788bd904fb83b1e\` ON \`participants\``,
    );
    await queryRunner.query(`DROP TABLE \`participants\``);
  }
}
