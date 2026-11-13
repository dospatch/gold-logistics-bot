const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (!['admin', 'owner', 'staff'].includes(req.user.role)) return res.status(403).json({ error: 'Administrator access required.' });
  next();
}

router.use(requireAuth, requireAdmin);

router.get('/overview', async (req, res, next) => {
  try {
    const [users, servers, licenses, online] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM servers').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*)::int AS count FROM licenses').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*)::int AS count FROM server_connections WHERE last_seen > NOW() - INTERVAL '2 minutes'").catch(() => ({ rows: [{ count: 0 }] })),
    ]);
    res.json({ users: users.rows[0].count, servers: servers.rows[0].count, licenses: licenses.rows[0].count, onlineAgents: online.rows[0].count });
  } catch (e) { next(e); }
});

const autoPostSchema = z.object({
  postType: z.enum(['server_recruitment','convoy','vtc_recruitment','changelog','maintenance']),
  enabled: z.boolean(),
  intervalHours: z.number().positive().max(8760),
  channelIds: z.array(z.string().regex(/^\d+$/)).max(25),
  message: z.string().max(4000).nullable().optional(),
});

router.get('/autopost', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, post_type, enabled, interval_hours, message, channel_ids, updated_at FROM autopost_settings ORDER BY post_type');
    res.json({ settings: result.rows });
  } catch (e) { next(e); }
});

router.put('/autopost/:postType', async (req, res, next) => {
  try {
    const input = autoPostSchema.parse({ ...req.body, postType: req.params.postType });
    const result = await pool.query(`INSERT INTO autopost_settings (post_type, enabled, interval_hours, channel_ids, message, updated_by)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (post_type) DO UPDATE SET enabled=EXCLUDED.enabled, interval_hours=EXCLUDED.interval_hours, channel_ids=EXCLUDED.channel_ids, message=EXCLUDED.message, updated_by=EXCLUDED.updated_by, updated_at=NOW()
      RETURNING *`, [input.postType, input.enabled, input.intervalHours, input.channelIds, input.message || null, req.user.sub]);
    res.json({ setting: result.rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;
