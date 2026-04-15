import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the 100 seeded demo users (and their bids) and adds Google SSO
 * fields to the users table. Users are now created on first sign-in via
 * Google OAuth rather than pre-seeded.
 */
export class AddAuthFieldsToUsers1744000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove all demo data (bids reference users, so clear bids first)
    await queryRunner.query(`DELETE FROM bids`);
    await queryRunner.query(`DELETE FROM users`);

    // Add Google SSO fields
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN google_id VARCHAR(255) NOT NULL,
        ADD COLUMN email     VARCHAR(255) NOT NULL,
        ADD COLUMN picture   VARCHAR(500)
    `);

    await queryRunner.query(`
      ALTER TABLE users
        ADD CONSTRAINT uq_users_google_id UNIQUE (google_id),
        ADD CONSTRAINT uq_users_email     UNIQUE (email)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        DROP CONSTRAINT IF EXISTS uq_users_email,
        DROP CONSTRAINT IF EXISTS uq_users_google_id
    `);

    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS picture,
        DROP COLUMN IF EXISTS email,
        DROP COLUMN IF EXISTS google_id
    `);
  }
}
