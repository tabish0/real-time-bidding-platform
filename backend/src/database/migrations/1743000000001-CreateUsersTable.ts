import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the users table and seeds exactly 100 hardcoded users.
 * Users are created once and never modified through the API — their IDs
 * are the only thing the application needs from them (for bid attribution).
 */
export class CreateUsersTable1743000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    const values = Array.from({ length: 100 }, (_, i) => `('User ${i + 1}')`)
      .join(',\n        ');

    await queryRunner.query(`
      INSERT INTO users (name) VALUES
        ${values}
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
