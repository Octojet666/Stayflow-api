const express = require('express');
const { query } = require('../db');
const { nightsBetween, calculateTotal, validateBooking } = require('../pricing');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const errors = validateBooking(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { roomId, guestName, guestEmail, checkIn, checkOut, guests } = req.body;

    const room = (await query('SELECT * FROM rooms WHERE id = $1', [roomId])).rows[0];
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (guests > room.capacity) {
      return res.status(400).json({ error: `Room sleeps at most ${room.capacity} guests` });
    }

    const total = calculateTotal(room.price_per_night, nightsBetween(checkIn, checkOut));

    const { rows } = await query(
      `INSERT INTO bookings (room_id, guest_name, guest_email, check_in, check_out, guests, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [roomId, guestName.trim(), guestEmail, checkIn, checkOut, guests, total]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    // 23P01 = exclusion_violation -> the room is already booked for these dates
    if (e.code === '23P01') {
      return res.status(409).json({ error: 'Room is already booked for those dates' });
    }
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Booking not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
