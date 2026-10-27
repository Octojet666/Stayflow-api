const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db');

const base = {
  roomId: 1, guestName: 'Nimal Perera', guestEmail: 'nimal@example.com',
  guests: 2, checkIn: '2026-12-01', checkOut: '2026-12-04',
};

beforeAll(async () => {
  const dir = path.join(__dirname, '..', '..', 'db');
  await pool.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
  await pool.query(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
});

beforeEach(() => pool.query('TRUNCATE bookings RESTART IDENTITY'));
afterAll(() => pool.end());

describe('POST /api/bookings', () => {
  test('creates a booking with the correct total', async () => {
    const res = await request(app).post('/api/bookings').send(base);
    expect(res.status).toBe(201);
    expect(res.body.total_price).toBe(555); // 3 nights x 185
  });

  test('rejects invalid input with 400', async () => {
    const res = await request(app).post('/api/bookings').send({ ...base, guestEmail: 'nope' });
    expect(res.status).toBe(400);
  });

  test('rejects too many guests for the room', async () => {
    const res = await request(app).post('/api/bookings').send({ ...base, guests: 10 });
    expect(res.status).toBe(400);
  });

  test('returns 404 for an unknown room', async () => {
    const res = await request(app).post('/api/bookings').send({ ...base, roomId: 999 });
    expect(res.status).toBe(404);
  });

  test('prevents double-booking with 409', async () => {
    await request(app).post('/api/bookings').send(base);
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...base, checkIn: '2026-12-03', checkOut: '2026-12-06' });
    expect(res.status).toBe(409);
  });

  test('allows back-to-back stays (check-out day = next check-in)', async () => {
    await request(app).post('/api/bookings').send(base);
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...base, checkIn: '2026-12-04', checkOut: '2026-12-06' });
    expect(res.status).toBe(201);
  });
});

describe('GET /api/rooms/available', () => {
  test('excludes rooms that are booked for the dates', async () => {
    await request(app).post('/api/bookings').send(base);
    const res = await request(app)
      .get('/api/rooms/available')
      .query({ checkIn: '2026-12-02', checkOut: '2026-12-05' });
    expect(res.status).toBe(200);
    expect(res.body.map((r) => r.id)).not.toContain(1);
    expect(res.body.length).toBe(3);
  });

  test('requires valid dates', async () => {
    const res = await request(app).get('/api/rooms/available');
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/bookings/:id', () => {
  test('cancels a booking and frees the room', async () => {
    const created = await request(app).post('/api/bookings').send(base);
    expect((await request(app).delete(`/api/bookings/${created.body.id}`)).status).toBe(204);
    expect((await request(app).post('/api/bookings').send(base)).status).toBe(201);
  });
});
