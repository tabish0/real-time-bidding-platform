import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the auctions table and seeds 5 sample auction records.
 *
 * Column decisions:
 *  - id: UUID for globally unique, non-sequential identifiers (safer for public APIs).
 *  - startingPrice / currentHighestBid: NUMERIC(12,2) to avoid floating-point rounding issues with money.
 *  - startsAt / endsAt: TIMESTAMPTZ to store timezone-aware timestamps; auction expiry is checked against these.
 *  - status: enum type to guard against invalid states at the DB level.
 *  - currentHighestBid nullable: NULL means no bid placed yet (semantically different from 0).
 */
export class CreateAuctionsTable1743000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE auction_status_enum AS ENUM ('active', 'ended', 'cancelled')
    `);

    // Create auctions table
    await queryRunner.query(`
      CREATE TABLE auctions (
        id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
        name                VARCHAR(255)      NOT NULL,
        description         TEXT              NOT NULL,
        starting_price      NUMERIC(12, 2)    NOT NULL CHECK (starting_price >= 0),
        current_highest_bid NUMERIC(12, 2)    NULL       CHECK (current_highest_bid >= 0),
        starts_at           TIMESTAMPTZ       NOT NULL,
        ends_at             TIMESTAMPTZ       NOT NULL,
        status              auction_status_enum NOT NULL DEFAULT 'active',
        created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

        CONSTRAINT auctions_ends_after_starts CHECK (ends_at > starts_at),
        CONSTRAINT auctions_highest_bid_gte_starting_price
          CHECK (current_highest_bid IS NULL OR current_highest_bid >= starting_price)
      )
    `);

    // Index for common query patterns
    await queryRunner.query(`
      CREATE INDEX idx_auctions_status   ON auctions (status);
      CREATE INDEX idx_auctions_ends_at  ON auctions (ends_at);
      CREATE INDEX idx_auctions_starts_at ON auctions (starts_at);
    `);

    // Auto-update updated_at on row changes
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER set_auctions_updated_at
      BEFORE UPDATE ON auctions
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    `);

    // Seed 5 sample auctions spanning different durations and states
    await queryRunner.query(`
      INSERT INTO auctions (id, name, description, starting_price, current_highest_bid, starts_at, ends_at, status)
      VALUES
        (
          gen_random_uuid(),
          'Vintage Rolex Submariner 1968',
          'An exceptional example of the iconic Rolex Submariner in stainless steel. Original dial, crown and bezel intact. Comes with period-accurate box.',
          4500.00,
          NULL,
          NOW(),
          NOW() + INTERVAL '3 days',
          'active'
        ),
        (
          gen_random_uuid(),
          'First Edition — The Great Gatsby',
          'First edition, first printing of F. Scott Fitzgerald''s masterpiece. Dust jacket present with minor edge wear. Authenticated by Sotheby''s.',
          8000.00,
          9200.00,
          NOW() - INTERVAL '1 day',
          NOW() + INTERVAL '2 days',
          'active'
        ),
        (
          gen_random_uuid(),
          'Banksy — "Balloon Girl" Signed Print',
          'Limited edition signed screen print by Banksy, number 47 of 150. Certificate of authenticity included. Professionally framed.',
          12000.00,
          15500.00,
          NOW() - INTERVAL '2 days',
          NOW() + INTERVAL '1 day',
          'active'
        ),
        (
          gen_random_uuid(),
          'Apple Mac 128K — Original 1984',
          'The original Macintosh 128K from 1984 in working condition. Includes original keyboard, mouse, and carrying bag. A genuine piece of computing history.',
          2200.00,
          NULL,
          NOW() + INTERVAL '1 hour',
          NOW() + INTERVAL '7 days',
          'active'
        ),
        (
          gen_random_uuid(),
          'Handwoven Silk Persian Rug — 19th Century',
          'Museum-quality 19th-century Persian Tabriz rug, approximately 9x12 ft. Natural dyes, silk pile on cotton foundation. Excellent condition for its age.',
          6500.00,
          7100.00,
          NOW() - INTERVAL '5 days',
          NOW() - INTERVAL '1 hour',
          'ended'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS set_auctions_updated_at ON auctions`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_set_updated_at`);
    await queryRunner.query(`DROP TABLE IF EXISTS auctions`);
    await queryRunner.query(`DROP TYPE IF EXISTS auction_status_enum`);
  }
}
