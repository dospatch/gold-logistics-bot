'use strict';

const env = require('./config/env');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function detectGame(payload) {
  const name = String(payload?.game?.gameName || payload?.game?.name || '').toUpperCase();
  if (name.includes('ATS') || name.includes('AMERICAN')) return 'ATS';
  if (name.includes('ETS2') || name.includes('EURO')) return 'ETS2';
  return 'UNKNOWN';
}

async function readTelemetry() {
  const separator = env.telemetryUrl.includes('?') ? '&' : '?';
  const response = await fetch(env.telemetryUrl + separator + 'truckworks_ts=' + Date.now(), { cache: 'no-store' });
  if (!response.ok) throw new Error('Telemetry server returned HTTP ' + response.status);
  return response.json();
}

async function sendTelemetry(payload) {
  if (!env.serverId) throw new Error('TRUCKWORKS_SERVER_ID is not configured.');
  if (!env.agentToken) throw new Error('TRUCKWORKS_AGENT_TOKEN is not configured.');
  const response = await fetch(env.apiUrl.replace(/\/$/, '') + '/api/telemetry/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + env.agentToken },
    body: JSON.stringify({ serverId: env.serverId, game: detectGame(payload), payload }),
  });
  if (!response.ok) throw new Error('TruckWorks API returned HTTP ' + response.status + ': ' + await response.text());
}

async function startTelemetryLoop() {
  console.log('Telemetry source: ' + env.telemetryUrl);
  console.log('Telemetry interval: ' + env.telemetryInterval + 'ms');
  while (true) {
    try {
      const payload = await readTelemetry();
      if (payload?.game?.connected) {
        await sendTelemetry(payload);
        console.log('[' + new Date().toISOString() + '] ' + detectGame(payload) + ' telemetry synced');
      } else {
        console.log('[' + new Date().toISOString() + '] Game telemetry not connected');
      }
    } catch (error) { console.error('[telemetry] ' + error.message); }
    await sleep(env.telemetryInterval);
  }
}

module.exports = { startTelemetryLoop };