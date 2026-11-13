const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const pool = require('../db');
const { jwtSecret, cookieSecure } = require('../config/env');
const { requireAuth } = require('../middleware/auth');

const router = require('express').Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

const registerSchema = credentialsSchema.extend({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_.-]+$/),
});

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
  };
}

function issueSession(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, username: user.username, role: user.role },
    jwtSecret,
    { expiresIn: '7d' },
  );
}

function setSessionCookie(res, token) {
  res.cookie('bc_tw_session', token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const username = input.username;

    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2) LIMIT 1',
      [email, username],
    );

    if (existing.rowCount) {
      return res.status(409).json({ error: 'An account with that email or username already exists.' });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, role, status, created_at`,
      [email, username, passwordHash],
    );

    const user = result.rows[0];
    setSessionCookie(res, issueSession(user));
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = credentialsSchema.parse(req.body);
    const result = await pool.query(
      `SELECT id, email, username, password_hash, role, status, created_at
       FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [input.email.toLowerCase()],
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: `This account is ${user.status}.` });
    }

    setSessionCookie(res, issueSession(user));
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('bc_tw_session', { httpOnly: true, secure: cookieSecure, sameSite: cookieSecure ? 'none' : 'lax', path: '/' });
  return res.json({ success: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, role, status, created_at FROM users WHERE id = $1 LIMIT 1',
      [req.user.sub],
    );

    if (!result.rowCount || result.rows[0].status !== 'active') {
      return res.status(401).json({ error: 'Account is no longer active.' });
    }

    return res.json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
