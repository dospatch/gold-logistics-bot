require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:3000',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  telemetryAgentToken: process.env.TELEMETRY_AGENT_TOKEN || process.env.TRUCKWORKS_AGENT_TOKEN || '',
};