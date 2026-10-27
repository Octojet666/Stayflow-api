// Pure business logic: no database, easy to unit test.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const LONG_STAY_NIGHTS = 7;
const LONG_STAY_DISCOUNT = 0.1;

function parseDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  // Reject things like 2026-02-31 that JS silently rolls over
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value
    ? null
    : d;
}

function nightsBetween(checkIn, checkOut) {
  const a = parseDate(checkIn);
  const b = parseDate(checkOut);
  if (!a || !b) throw new Error('Dates must be valid and formatted YYYY-MM-DD');
  const nights = Math.round((b - a) / 86400000);
  if (nights <= 0) throw new Error('Check-out must be after check-in');
  return nights;
}

function calculateTotal(pricePerNight, nights) {
  if (pricePerNight <= 0 || nights <= 0) {
    throw new Error('Price and nights must be positive');
  }
  const gross = pricePerNight * nights;
  const total = nights >= LONG_STAY_NIGHTS ? gross * (1 - LONG_STAY_DISCOUNT) : gross;
  return Math.round(total * 100) / 100;
}

function validateBooking(input = {}) {
  const errors = [];
  if (!Number.isInteger(input.roomId)) errors.push('roomId must be an integer');
  if (!input.guestName || !String(input.guestName).trim()) errors.push('guestName is required');
  if (!input.guestEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.guestEmail)) {
    errors.push('guestEmail must be a valid email');
  }
  if (!Number.isInteger(input.guests) || input.guests < 1) errors.push('guests must be at least 1');
  try {
    nightsBetween(input.checkIn, input.checkOut);
  } catch (e) {
    errors.push(e.message);
  }
  return errors;
}

module.exports = { nightsBetween, calculateTotal, validateBooking, parseDate };
