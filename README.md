# StayFlow API

![CI](https://github.com/Octojet666/Stayflow-api/actions/workflows/ci.yml/badge.svg)

A hotel room booking REST API built with **Node.js, Express and PostgreSQL**, with automated tests and a CI pipeline on GitHub Actions.

## Highlights

- **Double-booking is impossible at the database level.** A PostgreSQL exclusion constraint (`btree_gist` + `daterange`) rejects overlapping stays for the same room, so even simultaneous requests can't both succeed. The API turns this into a clean `409 Conflict`.
- **Pure business logic is separated and unit tested** (night counting, pricing, long-stay discount, validation).
- **Integration tests run against a real PostgreSQL**, not mocks, both locally and in CI.
- **CI** runs unit and integration tests on every push and pull request.

## Tech stack

Node.js 20, Express, PostgreSQL 16, Jest, Supertest, Docker Compose, GitHub Actions

## Getting started

```bash
git clone https://github.com/Octojet666/Stayflow-api
cd stayflow-api
cp .env.example .env
docker compose up -d        
npm install
npm run migrate             
npm run dev                
```

## Tests

```bash
npm run test:unit           
npm test                    
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/available?checkIn=2026-12-01&checkOut=2026-12-05` | Rooms free for the dates |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/:id` | Get a booking |
| DELETE | `/api/bookings/:id` | Cancel a booking |

Example:

```bash
curl -X POST localhost:3000/api/bookings -H "Content-Type: application/json" -d '{
  "roomId": 1, "guestName": "Nimal Perera", "guestEmail": "nimal@example.com",
  "guests": 2, "checkIn": "2026-12-01", "checkOut": "2026-12-04"
}'
```

## Pricing rules

Total = nightly rate x nights, with a 10% discount for stays of 7 nights or more. Check-out day is not charged, so back-to-back bookings are allowed.



