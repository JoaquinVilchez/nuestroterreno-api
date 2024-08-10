import { MigrationInterface, QueryRunner } from 'typeorm';

export class BasicLotParticipantAndResultTable1723158351410
  implements MigrationInterface
{
  name = 'BasicLotParticipantAndResultTable1723158351410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`participants\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ball_number\` int NOT NULL, \`first_name\` varchar(50) NOT NULL, \`last_name\` varchar(50) NOT NULL, \`secondary_last_name\` varchar(50) NOT NULL, \`dni\` varchar(8) NOT NULL, \`group\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_bc61c4f0e97788bd904fb83b1e\` (\`ball_number\`), UNIQUE INDEX \`IDX_13e755cb5b274a2bd087e1c1da\` (\`dni\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`lots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`group\` int NOT NULL, \`draw_type\` varchar(100) NOT NULL, \`denomination\` varchar(100) NOT NULL, \`image\` varchar(255) NOT NULL DEFAULT 'no-image.jpg', \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7b7781e695f4fab2b37c521285\` (\`denomination\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`results\` (\`id\` int NOT NULL AUTO_INCREMENT, \`group\` int NOT NULL, \`draw_type\` varchar(100) NOT NULL, \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`lot\` int NULL, \`participant\` int NULL, UNIQUE INDEX \`REL_3f2b23ba583006435c04d69496\` (\`lot\`), UNIQUE INDEX \`REL_88725df9d94bbfd5d74b1fddf5\` (\`participant\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_419028049a18ae3c44c5687890\` ON \`results\` (\`group\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_579c601d8a54572f6979cbc65d\` ON \`results\` (\`draw_type\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`results\` ADD CONSTRAINT \`FK_3f2b23ba583006435c04d694965\` FOREIGN KEY (\`lot\`) REFERENCES \`lots\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`results\` ADD CONSTRAINT \`FK_88725df9d94bbfd5d74b1fddf5c\` FOREIGN KEY (\`participant\`) REFERENCES \`participants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`results\` DROP FOREIGN KEY \`FK_88725df9d94bbfd5d74b1fddf5c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`results\` DROP FOREIGN KEY \`FK_3f2b23ba583006435c04d694965\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_579c601d8a54572f6979cbc65d\` ON \`results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_419028049a18ae3c44c5687890\` ON \`results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_88725df9d94bbfd5d74b1fddf5\` ON \`results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_3f2b23ba583006435c04d69496\` ON \`results\``,
    );
    await queryRunner.query(`DROP TABLE \`results\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7b7781e695f4fab2b37c521285\` ON \`lots\``,
    );
    await queryRunner.query(`DROP TABLE \`lots\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_13e755cb5b274a2bd087e1c1da\` ON \`participants\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bc61c4f0e97788bd904fb83b1e\` ON \`participants\``,
    );
    await queryRunner.query(`DROP TABLE \`participants\``);
  }
}
