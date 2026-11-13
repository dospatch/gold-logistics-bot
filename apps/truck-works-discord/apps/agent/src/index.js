'use strict';

const env = require('./config/env');
const { startTelemetryLoop } = require('./telemetry');

console.log('==============================================');
console.log(' BC TRUCK WORKS TELEMETRY AGENT');
console.log('==============================================');
console.log('API: ' + env.apiUrl);
console.log('Server ID: ' + (env.serverId || 'not configured'));
console.log('Agent ID: ' + (env.agentId || 'not configured'));
console.log('Telemetry source: ' + env.telemetryUrl);
console.log('Version: ' + env.agentVersion);
console.log('');

startTelemetryLoop().catch((error) => {
  console.error('[agent] Fatal error:', error);
  process.exit(1);
});