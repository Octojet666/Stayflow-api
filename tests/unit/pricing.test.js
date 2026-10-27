const { nightsBetween, calculateTotal, validateBooking } = require('../../src/pricing');

describe('nightsBetween', () => {
  test('counts nights between two dates', () => {
    expect(nightsBetween('2026-12-01', '2026-12-05')).toBe(4);
  });
  test('works across month and year boundaries', () => {
    expect(nightsBetween('2026-12-30', '2027-01-02')).toBe(3);
  });
  test('rejects check-out on or before check-in', () => {
    expect(() => nightsBetween('2026-12-05', '2026-12-05')).toThrow();
    expect(() => nightsBetween('2026-12-05', '2026-12-01')).toThrow();
  });
  test('rejects malformed and impossible dates', () => {
    expect(() => nightsBetween('12/01/2026', '2026-12-05')).toThrow();
    expect(() => nightsBetween('2026-02-31', '2026-03-05')).toThrow();
  });
});

describe('calculateTotal', () => {
  test('multiplies price by nights', () => {
    expect(calculateTotal(100, 3)).toBe(300);
  });
  test('applies 10% long-stay discount from 7 nights', () => {
    expect(calculateTotal(100, 6)).toBe(600);
    expect(calculateTotal(100, 7)).toBe(630);
  });
  test('rounds to 2 decimal places', () => {
    expect(calculateTotal(33.333, 3)).toBe(100);
  });
  test('rejects non-positive input', () => {
    expect(() => calculateTotal(0, 3)).toThrow();
    expect(() => calculateTotal(100, 0)).toThrow();
  });
});

describe('validateBooking', () => {
  const valid = {
    roomId: 1, guestName: 'Nimal Perera', guestEmail: 'nimal@example.com',
    guests: 2, checkIn: '2026-12-01', checkOut: '2026-12-04',
  };
  test('accepts a valid booking', () => {
    expect(validateBooking(valid)).toEqual([]);
  });
  test('collects every error', () => {
    const errors = validateBooking({ roomId: 'x', guestEmail: 'bad', guests: 0 });
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});
