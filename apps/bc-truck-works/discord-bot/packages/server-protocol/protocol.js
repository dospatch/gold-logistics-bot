'use strict';

/**
 * BC TRUCK WORKS
 * Server ↔ API communication protocol
 */

const PROTOCOL_VERSION = '1.0';

const MESSAGE_TYPES = Object.freeze({
  HEARTBEAT: 'heartbeat',
  STATUS: 'status',
  PLAYERS: 'players',
  SERVER_INFO: 'server_info',
  MODS: 'mods',
  COMMAND: 'command',
  COMMAND_RESULT: 'command_result'
});

const SERVER_STATUS = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline',
  STARTING: 'starting',
  STOPPING: 'stopping',
  UNKNOWN: 'unknown'
});

const GAMES = Object.freeze({
  ATS: 'ATS',
  ETS2: 'ETS2',
  OTHER: 'OTHER'
});

function createHeartbeat(payload = {}) {
  return {
    type: MESSAGE_TYPES.HEARTBEAT,
    protocolVersion: PROTOCOL_VERSION,
    timestamp: new Date().toISOString(),
    serverId: payload.serverId || null,
    agentId: payload.agentId || null,
    status: payload.status || SERVER_STATUS.UNKNOWN,
    players: Number.isFinite(payload.players) ? payload.players : 0,
    agentVersion: payload.agentVersion || null
  };
}

function createStatus(payload = {}) {
  return {
    type: MESSAGE_TYPES.STATUS,
    protocolVersion: PROTOCOL_VERSION,
    timestamp: new Date().toISOString(),
    serverId: payload.serverId || null,
    status: payload.status || SERVER_STATUS.UNKNOWN
  };
}

function createPlayers(payload = {}) {
  return {
    type: MESSAGE_TYPES.PLAYERS,
    protocolVersion: PROTOCOL_VERSION,
    timestamp: new Date().toISOString(),
    serverId: payload.serverId || null,
    players: Array.isArray(payload.players) ? payload.players : []
  };
}

function validateMessage(message) {
  if (!message || typeof message !== 'object') {
    return {
      valid: false,
      error: 'Message must be an object.'
    };
  }

  if (!message.type) {
    return {
      valid: false,
      error: 'Message type is required.'
    };
  }

  if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
    return {
      valid: false,
      error: `Unsupported message type: ${message.type}`
    };
  }

  if (message.protocolVersion !== PROTOCOL_VERSION) {
    return {
      valid: false,
      error: `Unsupported protocol version: ${message.protocolVersion}`
    };
  }

  return {
    valid: true,
    error: null
  };
}

module.exports = {
  PROTOCOL_VERSION,
  MESSAGE_TYPES,
  SERVER_STATUS,
  GAMES,
  createHeartbeat,
  createStatus,
  createPlayers,
  validateMessage
};
