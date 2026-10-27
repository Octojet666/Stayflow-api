CREATE EXTENSION IF NOT EXISTS btree_gist;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;

CREATE TABLE rooms (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night > 0),
  capacity        INTEGER NOT NULL CHECK (capacity > 0)
);

CREATE TABLE bookings (
  id          SERIAL PRIMARY KEY,
  room_id     INTEGER NOT NULL REFERENCES rooms(id),
  guest_name  TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  check_in    DATE NOT NULL,
  check_out   DATE NOT NULL,
  guests      INTEGER NOT NULL CHECK (guests > 0),
  total_price NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in),
  -- The database itself refuses double-bookings for the same room
  CONSTRAINT no_double_booking EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out) WITH &&
  )
);

CREATE INDEX idx_bookings_room ON bookings(room_id);
