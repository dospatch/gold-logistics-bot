'use strict';

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

function validateServerCreate(input = {}) {
  const name = requireString(input.name, 'Server name');
  const game = requireString(input.game, 'Game');

  return {
    name,
    game,
    description:
      typeof input.description === 'string'
        ? input.description.trim()
        : null
  };
}

function validateHeartbeat(input = {}) {
  return {
    serverId: requireString(input.serverId, 'Server ID'),
    agentId: requireString(input.agentId, 'Agent ID'),
    status: requireString(input.status, 'Status'),
    players:
      Number.isFinite(Number(input.players))
        ? Math.max(0, Number(input.players))
        : 0,
    agentVersion: requireString(
      input.agentVersion || 'unknown',
      'Agent version'
    )
  };
}

module.exports = {
  requireString,
  validateServerCreate,
  validateHeartbeat
};
