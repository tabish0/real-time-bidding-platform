# Real-Time Bidding Platform

A full-stack auction platform where users can create auctions and place bids in real time. Users are pre-seeded and selectable from the navigation bar on the dashboard — no authentication required. Multiple auctions can run concurrently with many users bidding simultaneously.

**Live:** [sincere-gentleness-production.up.railway.app](https://bid-now-production.up.railway.app/)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, Socket.IO |
| Frontend | React 19, Vite, TypeScript, TanStack Query, Zustand, Socket.IO client |
| Infrastructure | Docker, GitHub Actions, Railway |

---

## Running Locally

### Without Docker

**Prerequisites:** Node.js 20+, PostgreSQL 16+

```bash
# Backend
cd backend && cp .env.example .env   # fill in your Postgres credentials
npm install && npm run migration:run && npm run start:dev
# API: http://localhost:3000/api/v1  |  Swagger: http://localhost:3000/api/v1/docs

# Frontend
cd frontend
# create .env with: VITE_API_BASE_URL=http://localhost:3000/api/v1 and VITE_WS_BASE_URL=http://localhost:3000
npm install && npm run dev
# App: http://localhost:3001
```

### With Docker

```bash
docker compose up --build
```

Starts three containers — postgres, backend (runs migrations on startup), and frontend served via nginx.
App available at `http://localhost`.

---

## Approach & Key Decisions

### The core problem

Multiple users placing bids on the same auction at the same moment creates a **race condition**: two requests can both read the same `currentHighestBid`, both pass the "bid must be higher" check, and both get accepted — meaning the lower bid could end up winning. Under high concurrency this happens frequently without explicit protection.

### Solution: Pessimistic write lock inside a serialised transaction

Every bid placement runs inside a **PostgreSQL transaction with a pessimistic write lock** on the auction row:

```typescript
const auction = await manager.findOne(Auction, {
  where: { id: auctionId },
  lock: { mode: 'pessimistic_write' },
});
```

This means only one bid transaction can hold the lock at a time. All others wait in a queue. The sequence for 10 concurrent bids at the same amount looks like this:

```
Request 1 acquires lock → validates ($101 > $100 ✓) → saves bid → releases lock
Request 2 acquires lock → validates ($101 > $101 ✗) → rejects with 400
Request 3 acquires lock → validates ($101 > $101 ✗) → rejects with 400
... and so on
```

Result: exactly one bid wins, the database stays consistent, and no application-level retry logic is needed.

The WebSocket event is emitted **outside the transaction** (after commit) so the real-time notification only fires if the bid actually persisted — no false updates to connected clients.

#### Why not optimistic locking?

Optimistic locking (version columns, retry on conflict) works well when conflicts are rare. In a bidding platform, many users deliberately target the same auction at the same time — conflict is the normal case, not the edge case. Optimistic locking would produce a flood of retries under load. Pessimistic locking gives a clean queue with no retry complexity.

#### Why not a message queue (Redis + Bull)?

A queue would handle higher throughput spikes and decouple bid processing, but it makes bid placement **asynchronous** — the user submits a bid and waits for a callback rather than getting an instant response. That's a worse user experience for an auction platform and adds significant infrastructure complexity. The database lock is simpler, synchronous, and handles the expected load comfortably.

---

### Real-time updates: Socket.IO rooms per auction

Each auction gets its own Socket.IO room (`auction:<id>`). When a user opens an auction page they join that room. When a bid is accepted the server broadcasts only to that room:

```typescript
this.server.to(`auction:${auctionId}`).emit('bid-placed', payload);
```

Users watching other auctions receive no irrelevant traffic. This scales cleanly to thousands of concurrent auctions without any fan-out overhead.

---

### Frontend state: TanStack Query cache surgery

Rather than polling the API every few seconds, the frontend keeps a TanStack Query cache and updates it surgically on each WebSocket event:

- The new bid is inserted into the bids list cache and sorted by `createdAt DESC`
- The auction's `currentHighestBid` is updated in-place on the auction detail cache
- Both updates include a duplicate check to handle the race between the REST response and the WebSocket event arriving at nearly the same time

This means the UI updates in milliseconds with no loading state and no full refetch.

---

## CI/CD Pipeline

On every push or PR to `main`, GitHub Actions runs:

```
├── test-backend    (jest + coverage)
└── test-frontend   (tsc + eslint + vitest)
        │
        └── build-and-push  (main only — pushes Docker images to GHCR)
```

Railway watches `main` and auto-deploys each service when its Watch Paths change (`backend/**` or `frontend/**`).
