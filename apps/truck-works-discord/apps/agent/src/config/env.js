'use strict';

require('dotenv').config();

const env = {
  apiUrl: process.env.TRUCKWORKS_API_URL || 'http://localhost:4000',
  serverId: process.env.TRUCKWORKS_SERVER_ID || '',
  agentId: process.env.TRUCKWORKS_AGENT_ID || '',
  agentToken: process.env.TRUCKWORKS_AGENT_TOKEN || '',
  agentVersion: process.env.TRUCKWORKS_AGENT_VERSION || '1.1.0',
  heartbeatInterval: Number(process.env.TRUCKWORKS_HEARTBEAT_INTERVAL || 30000),
  telemetryUrl: process.env.TRUCKWORKS_TELEMETRY_URL || 'http://127.0.0.1:25555/api/ets2/telemetry',
  telemetryInterval: Number(process.env.TRUCKWORKS_TELEMETRY_INTERVAL || 1000),
};

module.exports = env;