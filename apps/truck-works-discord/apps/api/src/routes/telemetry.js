const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { telemetryAgentToken } = require('../config/env');

const ingestSchema = z.object({
  serverId: z.string().uuid(),
  game: z.enum(['ATS','ETS2','UNKNOWN']).optional(),
  payload: z.record(z.any()),
});

router.post('/telemetry/ingest', async (req, res, next) => {
  try {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!telemetryAgentToken || !token || token !== telemetryAgentToken) {
      return res.status(401).json({ error: 'Telemetry agent authentication failed.' });
    }
    const input = ingestSchema.parse(req.body);
    const rawGame = String(input.game || input.payload?.game?.gameName || '').toUpperCase();
    const gameName = rawGame.includes('ATS') || rawGame.includes('AMERICAN') ? 'ATS' : rawGame.includes('ETS2') || rawGame.includes('EURO') ? 'ETS2' : 'UNKNOWN';
    const connected = Boolean(input.payload?.game?.connected);
    const result = await pool.query(
      `INSERT INTO server_telemetry (server_id, game, connected, payload, updated_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (server_id) DO UPDATE SET game=EXCLUDED.game, connected=EXCLUDED.connected, payload=EXCLUDED.payload, updated_at=NOW()
       RETURNING server_id, game, connected, updated_at`,
      [input.serverId, gameName, connected, input.payload]
    );
    res.status(202).json({ telemetry: result.rows[0] });
  } catch (error) { next(error); }
});

router.get('/telemetry/:serverId', requireAuth, async (req, res, next) => {
  try {
    const ownership = await pool.query(
      `SELECT id, name, game FROM servers
       WHERE id=$1 AND (owner_id=$2 OR $3 IN ('admin','owner','staff')) LIMIT 1`,
      [req.params.serverId, req.user.sub, req.user.role]
    );
    if (!ownership.rowCount) return res.status(403).json({ error: 'Server access denied.' });
    const result = await pool.query(`SELECT server_id, game, connected, payload, updated_at FROM server_telemetry WHERE server_id=$1 LIMIT 1`, [req.params.serverId]);
    res.json({ telemetry: result.rowCount ? result.rows[0] : null });
  } catch (error) { next(error); }
});

module.exports = router;