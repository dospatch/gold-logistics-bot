const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const gameSchema = z.enum(['ATS', 'ETS2']);

const tripStartSchema = z.object({
  game: gameSchema,
  truckName: z.string().trim().max(160).nullable().optional(),
  cargo: z.string().trim().max(240).nullable().optional(),
  routeName: z.string().trim().max(240).nullable().optional(),
  income: z.number().finite().nonnegative().max(100000000).default(0),
  odometerKm: z.number().finite().nonnegative().nullable().optional(),
  fuel: z.number().finite().nonnegative().nullable().optional(),
  metadata: z.record(z.any()).optional(),
});

const tripEndSchema = z.object({
  odometerKm: z.number().finite().nonnegative().nullable().optional(),
  fuel: z.number().finite().nonnegative().nullable().optional(),
  cargo: z.string().trim().max(240).nullable().optional(),
  routeName: z.string().trim().max(240).nullable().optional(),
  income: z.number().finite().nonnegative().max(100000000).optional(),
  status: z.enum(['completed', 'cancelled']).default('completed'),
  metadata: z.record(z.any()).optional(),
});

router.post('/trips/start', requireAuth, async (req, res, next) => {
  try {
    const input = tripStartSchema.parse(req.body);
    const existing = await pool.query(
      'SELECT id FROM driver_trips WHERE user_id=$1 AND status=\'active\' LIMIT 1',
      [req.user.sub],
    );

    if (existing.rowCount) {
      return res.status(409).json({ error: 'You already have an active trip.', tripId: existing.rows[0].id });
    }

    const result = await pool.query(
      `INSERT INTO driver_trips
        (user_id, game, status, truck_name, cargo, route_name, income, odometer_start_km, fuel_start, metadata)
       VALUES ($1,$2,'active',$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.user.sub,
        input.game,
        input.truckName || null,
        input.cargo || null,
        input.routeName || null,
        input.income,
        input.odometerKm ?? null,
        input.fuel ?? null,
        input.metadata || {},
      ],
    );

    return res.status(201).json({ trip: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.post('/trips/end', requireAuth, async (req, res, next) => {
  try {
    const input = tripEndSchema.parse(req.body);
    const active = await pool.query(
      'SELECT * FROM driver_trips WHERE user_id=$1 AND status=\'active\' LIMIT 1',
      [req.user.sub],
    );

    if (!active.rowCount) {
      return res.status(404).json({ error: 'No active trip found.' });
    }

    const trip = active.rows[0];
    const endKm = input.odometerKm ?? null;
    const miles =
      endKm !== null && trip.odometer_start_km !== null
        ? Math.max(0, Number(((endKm - Number(trip.odometer_start_km)) * 0.621371).toFixed(3)))
        : Number(trip.miles || 0);

    const result = await pool.query(
      `UPDATE driver_trips
       SET status=$2,
           odometer_end_km=$3,
           miles=$4,
           fuel_end=$5,
           cargo=COALESCE($6, cargo),
           route_name=COALESCE($7, route_name),
           income=COALESCE($8, income),
           metadata=metadata || $9::jsonb,
           ended_at=NOW(),
           updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [
        trip.id,
        input.status,
        endKm,
        miles,
        input.fuel ?? null,
        input.cargo ?? null,
        input.routeName ?? null,
        input.income ?? null,
        JSON.stringify(input.metadata || {}),
      ],
    );

    return res.json({ trip: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.get('/trips', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const result = await pool.query(
      `SELECT id, game, status, truck_name, cargo, route_name, income,
              odometer_start_km, odometer_end_km, miles, fuel_start, fuel_end,
              started_at, ended_at, created_at
       FROM driver_trips
       WHERE user_id=$1
       ORDER BY started_at DESC
       LIMIT $2`,
      [req.user.sub, limit],
    );

    return res.json({ trips: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/trips/stats', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS trip_count,
         COALESCE(SUM(miles),0)::numeric AS miles,
         COALESCE(SUM(income),0)::numeric AS income,
         COALESCE(SUM(CASE WHEN game='ATS' THEN miles ELSE 0 END),0)::numeric AS ats_miles,
         COALESCE(SUM(CASE WHEN game='ETS2' THEN miles ELSE 0 END),0)::numeric AS ets2_miles,
         COALESCE(SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END),0)::int AS completed_trips
       FROM driver_trips
       WHERE user_id=$1`,
      [req.user.sub],
    );

    const active = await pool.query(
      `SELECT id, game, truck_name, cargo, route_name, income, odometer_start_km, fuel_start, started_at
       FROM driver_trips
       WHERE user_id=$1 AND status='active'
       LIMIT 1`,
      [req.user.sub],
    );

    return res.json({ stats: result.rows[0], activeTrip: active.rowCount ? active.rows[0] : null });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
