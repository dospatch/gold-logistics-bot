const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const presenceSchema = z.object({
  platform: z.enum(['steam','truckersmp','other']),
  platformId: z.string().trim().max(128).nullable().optional(),
  displayName: z.string().trim().min(1).max(128),
  accountUserId: z.string().uuid().nullable().optional(),
  online: z.boolean().default(true),
});

router.post('/servers/:serverId/presence', requireAuth, async (req, res, next) => {
  try {
    const input = presenceSchema.parse(req.body);
    const owned = await pool.query('SELECT id FROM servers WHERE id=$1 AND owner_id=$2 LIMIT 1', [req.params.serverId, req.user.sub]);
    if (!owned.rowCount && !['admin','owner','staff'].includes(req.user.role)) return res.status(403).json({ error: 'Server access denied.' });
    const result = await pool.query(`INSERT INTO player_presence (server_id, platform, platform_id, display_name, account_user_id, currently_online)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (server_id, platform, platform_id) DO UPDATE SET display_name=EXCLUDED.display_name, account_user_id=COALESCE(EXCLUDED.account_user_id, player_presence.account_user_id), last_seen=NOW(), currently_online=EXCLUDED.currently_online
      RETURNING *`, [req.params.serverId,input.platform,input.platformId || null,input.displayName,input.accountUserId || null,input.online]);
    res.status(201).json({ player: result.rows[0] });
  } catch (e) { next(e); }
});

router.get('/servers/:serverId/presence', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT pp.id, pp.platform, pp.platform_id, pp.display_name, pp.currently_online, pp.first_seen, pp.last_seen, u.username AS account_username
      FROM player_presence pp LEFT JOIN users u ON u.id=pp.account_user_id WHERE pp.server_id=$1 ORDER BY pp.currently_online DESC, pp.display_name`, [req.params.serverId]);
    res.json({ players: result.rows });
  } catch (e) { next(e); }
});

module.exports = router;
