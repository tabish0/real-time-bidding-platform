/**
 * Concurrent Bid Race-Condition Load Test
 * ========================================
 * Validates that the pessimistic write-lock in BidService correctly
 * serialises concurrent bids so that:
 *   - At most ONE bid wins when N requests fire at the exact same amount.
 *   - Sequential bids (each higher than the last) all land cleanly.
 *   - The auction's currentHighestBid is always consistent with what was saved.
 *
 * Usage:
 *   node scripts/load-test-bids.mjs [BASE_URL]
 *
 * Requires a running API + seeded database (npm run start:dev + migrations applied).
 * The script creates a fresh auction for every scenario so runs are idempotent.
 */

const BASE = process.argv[2]?.replace(/\/$/, '') ?? 'http://localhost:3000/api/v1';

// ─── ANSI colours ────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold:  '\x1b[1m',
  red:   '\x1b[31m',
  green: '\x1b[32m',
  yellow:'\x1b[33m',
  cyan:  '\x1b[36m',
  dim:   '\x1b[2m',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

function pass(msg)  { console.log(`  ${c.green}✔${c.reset} ${msg}`); }
function fail(msg)  { console.log(`  ${c.red}✘${c.reset} ${msg}`); }
function warn(msg)  { console.log(`  ${c.yellow}⚠${c.reset} ${msg}`); }
function info(msg)  { console.log(`  ${c.dim}${msg}${c.reset}`); }
function section(s) { console.log(`\n${c.bold}${c.cyan}▶ ${s}${c.reset}`); }

let passed = 0;
let failed = 0;

function assert(condition, okMsg, failMsg) {
  if (condition) { pass(okMsg); passed++; }
  else           { fail(failMsg); failed++; }
}

// ─── Setup: fetch real users from the DB ─────────────────────────────────────
async function getUsers(n) {
  const { status, body } = await api('GET', '/users');
  if (status !== 200) throw new Error(`GET /users returned ${status}`);
  const users = body.data ?? body;
  if (!Array.isArray(users) || users.length < n) {
    throw new Error(`Need at least ${n} seeded users, got ${users.length}`);
  }
  return users.slice(0, n);
}

async function createAuction(startingPrice = 100) {
  const { status, body } = await api('POST', '/auctions', {
    name: `Load Test Auction ${Date.now()}`,
    description: 'Created by load-test-bids.mjs — safe to delete.',
    startingPrice,
    durationHours: 2,
  });
  if (status !== 201) throw new Error(`POST /auctions returned ${status}: ${JSON.stringify(body)}`);
  return body.data ?? body;
}

async function getAuction(id) {
  const { status, body } = await api('GET', `/auctions/${id}`);
  if (status !== 200) throw new Error(`GET /auctions/${id} returned ${status}`);
  return body.data ?? body;
}

async function placeBid(auctionId, userId, amount) {
  const t0 = Date.now();
  const { status, body } = await api('POST', `/auctions/${auctionId}/bids`, { userId, amount });
  return { status, body, ms: Date.now() - t0 };
}

async function getAuctionBids(auctionId) {
  const { status, body } = await api('GET', `/auctions/${auctionId}/bids`);
  if (status !== 200) throw new Error(`GET /auctions/${auctionId}/bids returned ${status}`);
  return body.data ?? body;
}

// ─── Scenario 1 ──────────────────────────────────────────────────────────────
// N requests all fire simultaneously with the same amount (just above starting price).
// Only ONE should succeed — the pessimistic lock serialises access.
async function scenarioSameAmount(users) {
  section('Scenario 1 — Concurrent bids at identical amount (race condition)');
  const CONCURRENCY = 10;
  const STARTING_PRICE = 100;
  const BID_AMOUNT = 101;

  const auction = await createAuction(STARTING_PRICE);
  info(`Auction ${auction.id} (starting price $${STARTING_PRICE})`);
  info(`Firing ${CONCURRENCY} simultaneous bids at $${BID_AMOUNT}…`);

  const requests = users.slice(0, CONCURRENCY).map((u) =>
    placeBid(auction.id, u.id, BID_AMOUNT),
  );

  const results = await Promise.allSettled(requests);
  const resolved = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);

  const successes = resolved.filter((r) => r.status === 201);
  const rejections = resolved.filter((r) => r.status === 400);
  const unexpected = resolved.filter((r) => r.status !== 201 && r.status !== 400);

  info(`Results: ${successes.length} accepted, ${rejections.length} rejected (400), ${unexpected.length} unexpected`);
  resolved.forEach((r, i) => {
    const icon = r.status === 201 ? c.green + '✔' : c.dim + '✘';
    const msg  = r.status === 201
      ? `Bid accepted — id ${(r.body.data ?? r.body)?.id}`
      : (r.body.message ?? JSON.stringify(r.body));
    info(`  [${i}] ${icon}${c.reset} HTTP ${r.status} | ${r.ms}ms | ${msg}`);
  });

  assert(successes.length === 1,
    'Exactly 1 bid was accepted',
    `Expected 1 accepted bid, got ${successes.length}`);

  assert(rejections.length === CONCURRENCY - 1,
    `Remaining ${CONCURRENCY - 1} bids correctly rejected with 400`,
    `Expected ${CONCURRENCY - 1} rejections, got ${rejections.length}`);

  assert(unexpected.length === 0,
    'No unexpected HTTP statuses',
    `Got unexpected statuses: ${unexpected.map((r) => r.status).join(', ')}`);

  // Verify the auction row is consistent
  const freshAuction = await getAuction(auction.id);
  assert(Number(freshAuction.currentHighestBid) === BID_AMOUNT,
    `auction.currentHighestBid = $${freshAuction.currentHighestBid} (expected $${BID_AMOUNT})`,
    `auction.currentHighestBid mismatch: got $${freshAuction.currentHighestBid}`);

  const bids = await getAuctionBids(auction.id);
  assert(bids.length === 1,
    'Exactly 1 bid row exists in the database',
    `Expected 1 bid in DB, found ${bids.length}`);
}

// ─── Scenario 2 ──────────────────────────────────────────────────────────────
// N users race with strictly increasing amounts — all should succeed because
// each amount is unique and always above the previous.
// BUT because requests are concurrent the lock must still do its job; the
// amounts are spread far enough apart that whoever wins the lock first will
// leave a currentHighestBid that is still below the next request's amount.
async function scenarioDifferentAmounts(users) {
  section('Scenario 2 — Concurrent bids at distinct escalating amounts');
  const CONCURRENCY = 8;
  const STARTING_PRICE = 100;

  // Each bid is 50 apart so any ordering of the lock is valid — all should land.
  const amounts = Array.from({ length: CONCURRENCY }, (_, i) => STARTING_PRICE + 50 * (i + 1));
  info(`Amounts: ${amounts.join(', ')}`);

  const auction = await createAuction(STARTING_PRICE);
  info(`Auction ${auction.id} (starting price $${STARTING_PRICE})`);
  info(`Firing ${CONCURRENCY} simultaneous bids…`);

  // NOTE: these WON'T all succeed concurrently because the lock serialises them,
  // and after bid N lands, bid N-1 (if it got the lock second) may be below the
  // new currentHighestBid. That's correct behaviour — we verify at least the
  // highest-amount bid always lands and no duplicate currentHighestBid exists.
  const requests = users.slice(0, CONCURRENCY).map((u, i) =>
    placeBid(auction.id, u.id, amounts[i]),
  );

  const results = await Promise.allSettled(requests);
  const resolved = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);

  const successes = resolved.filter((r) => r.status === 201);
  const rejections = resolved.filter((r) => r.status === 400);

  info(`Results: ${successes.length} accepted, ${rejections.length} rejected`);
  resolved.forEach((r, i) => {
    const icon = r.status === 201 ? c.green + '✔' : c.dim + '✘';
    const detail = r.status === 201
      ? `amount $${(r.body.data ?? r.body)?.amount}`
      : (r.body.message ?? '');
    info(`  [${i}] ${icon}${c.reset} HTTP ${r.status} | ${r.ms}ms | $${amounts[i]} → ${detail}`);
  });

  assert(successes.length >= 1,
    `At least 1 bid accepted (got ${successes.length})`,
    'No bids were accepted');

  // The highest amount bid must always win eventually (it can never be outbid).
  const maxAmount = Math.max(...amounts);
  const freshAuction = await getAuction(auction.id);
  assert(Number(freshAuction.currentHighestBid) === maxAmount,
    `auction.currentHighestBid = $${freshAuction.currentHighestBid} = highest submitted amount`,
    `Expected currentHighestBid=$${maxAmount}, got $${freshAuction.currentHighestBid}`);

  const bids = await getAuctionBids(auction.id);
  const savedAmounts = bids.map((b) => Number(b.amount));
  const hasDuplicates = new Set(savedAmounts).size !== savedAmounts.length;
  assert(!hasDuplicates,
    'No duplicate bid amounts in database',
    `Duplicate amounts found: ${savedAmounts.join(', ')}`);
}

// ─── Scenario 3 ──────────────────────────────────────────────────────────────
// Sequential bids — baseline sanity check, not a concurrency test.
// Every bid must succeed because each waits for the previous to complete.
async function scenarioSequential(users) {
  section('Scenario 3 — Sequential bids (baseline correctness)');
  const STEPS = 5;
  const STARTING_PRICE = 100;

  const auction = await createAuction(STARTING_PRICE);
  info(`Auction ${auction.id}`);

  let floor = STARTING_PRICE;
  let allOk = true;

  for (let i = 0; i < STEPS; i++) {
    const amount = floor + 50;
    const user   = users[i];
    const { status, body, ms } = await placeBid(auction.id, user.id, amount);
    const ok = status === 201;
    info(`  Bid $${amount} by user ${user.id.slice(0, 8)}… → HTTP ${status} (${ms}ms)`);
    if (!ok) { allOk = false; warn(`  Rejected: ${body.message ?? JSON.stringify(body)}`); }
    else floor = amount;
  }

  assert(allOk, `All ${STEPS} sequential bids accepted`, 'One or more sequential bids were rejected');

  const freshAuction = await getAuction(auction.id);
  assert(Number(freshAuction.currentHighestBid) === floor,
    `Final currentHighestBid = $${freshAuction.currentHighestBid}`,
    `currentHighestBid mismatch: expected $${floor}, got $${freshAuction.currentHighestBid}`);

  const bids = await getAuctionBids(auction.id);
  assert(bids.length === STEPS,
    `${STEPS} bid rows in database`,
    `Expected ${STEPS} bids, found ${bids.length}`);
}

// ─── Scenario 4 ──────────────────────────────────────────────────────────────
// Burst of requests BELOW the current floor — all must be rejected.
async function scenarioBelowFloor(users) {
  section('Scenario 4 — Concurrent bids all below the current floor (all must reject)');
  const STARTING_PRICE = 500;
  const FLOOR_BID = 600;
  const LOW_AMOUNT = 550; // above starting price but below the floor bid

  const auction = await createAuction(STARTING_PRICE);
  // Establish a floor first
  const { status: s } = await placeBid(auction.id, users[0].id, FLOOR_BID);
  if (s !== 201) throw new Error(`Could not establish floor bid, got HTTP ${s}`);
  info(`Auction ${auction.id} — floor established at $${FLOOR_BID}`);

  const CONCURRENCY = 6;
  info(`Firing ${CONCURRENCY} concurrent bids at $${LOW_AMOUNT} (below floor $${FLOOR_BID})…`);

  const requests = users.slice(1, 1 + CONCURRENCY).map((u) =>
    placeBid(auction.id, u.id, LOW_AMOUNT),
  );
  const results = await Promise.allSettled(requests);
  const resolved = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const rejections = resolved.filter((r) => r.status === 400);

  info(`Results: ${resolved.filter((r) => r.status === 201).length} accepted, ${rejections.length} rejected`);

  assert(rejections.length === CONCURRENCY,
    `All ${CONCURRENCY} below-floor bids rejected with 400`,
    `Expected ${CONCURRENCY} rejections, got ${rejections.length}`);

  const freshAuction = await getAuction(auction.id);
  assert(Number(freshAuction.currentHighestBid) === FLOOR_BID,
    `currentHighestBid unchanged at $${freshAuction.currentHighestBid}`,
    `currentHighestBid changed — expected $${FLOOR_BID}, got $${freshAuction.currentHighestBid}`);
}

// ─── Runner ──────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n${c.bold}Bid Concurrency Load Test${c.reset}`);
  console.log(`${c.dim}Target: ${BASE}${c.reset}`);

  let users;
  try {
    users = await getUsers(12);
    info(`Loaded ${users.length} users from API`);
  } catch (err) {
    console.error(`\n${c.red}Setup failed — is the server running at ${BASE}?${c.reset}`);
    console.error(err.message);
    process.exit(1);
  }

  await scenarioSameAmount(users);
  await scenarioDifferentAmounts(users);
  await scenarioSequential(users);
  await scenarioBelowFloor(users);

  // ─── Summary ─────────────────────────────────────────────────────────────
  const total = passed + failed;
  const colour = failed === 0 ? c.green : c.red;
  console.log(`\n${c.bold}${colour}Results: ${passed}/${total} assertions passed${c.reset}`);

  if (failed > 0) {
    console.log(`${c.red}${c.bold}FAILED — the locking implementation has gaps.${c.reset}`);
    process.exit(1);
  } else {
    console.log(`${c.green}${c.bold}PASSED — pessimistic lock is working correctly under load.${c.reset}\n`);
  }
}

run().catch((err) => {
  console.error(`\n${c.red}Unexpected error:${c.reset}`, err);
  process.exit(1);
});
