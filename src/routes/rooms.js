const express = require('express');
const { query } = require('../db');
const { nightsBetween } = require('../pricing');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM rooms ORDER BY id');
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/rooms/available?checkIn=2026-12-01&checkOut=2026-12-05
router.get('/available', async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    try { nightsBetween(checkIn, checkOut); }
    catch (e) { return res.status(400).json({ error: e.message }); }

    const { rows } = await query(
      `SELECT r.* FROM rooms r
       WHERE NOT EXISTS (
         SELECT 1 FROM bookings b
         WHERE b.room_id = r.id
           AND daterange(b.check_in, b.check_out) && daterange($1::date, $2::date)
       )
       ORDER BY r.id`,
      [checkIn, checkOut]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
