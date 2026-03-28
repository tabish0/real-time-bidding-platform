import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the bids table.
 *
 * Design decisions:
 *  - No UPDATE or DELETE on bids — they are append-only (auction ledger).
 *  - amount stored as NUMERIC(12,2) consistent with auctions table.
 *  - FK on auction_id and user_id with ON DELETE RESTRICT to prevent orphans.
 *  - Index on auction_id is the dominant query pattern (get bids for an auction).
 *  - No unique constraint on (auction_id, user_id) — a user may bid multiple times.
 */
export class CreateBidsTable1743000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE bids (
        id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        auction_id UUID           NOT NULL REFERENCES auctions(id) ON DELETE RESTRICT,
        user_id    UUID           NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
        amount     NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
        created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_bids_auction_id ON bids (auction_id);
      CREATE INDEX idx_bids_created_at ON bids (created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bids`);
  }
}
