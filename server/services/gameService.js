import { DEFAULT_EDITION } from "../../shared/defaultEdition.js";

export const lobbies = {};

export function generateLobbyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function getLobby(lobbyCode) {
  return lobbies[lobbyCode] ?? null;
}

// function to create lobby
export function createLobby(hostUid, hostUsername, edition = DEFAULT_EDITION) {
  const lobbyCode = generateLobbyCode();

  lobbies[lobbyCode] = {
    lobbyCode: lobbyCode,
    status: "waiting",
    players: [],
    host: { uid: hostUid, username: hostUsername, socketId: null },
    edition,
    currentTurnUid: null,
    lastRoll: null,
    winnerUid: null,
  };
  console.log(lobbies);
  return lobbies[lobbyCode];
}

// function for joining lobby
export function joinLobby(lobbyCode, playerData) {
  const lobby = getLobby(lobbyCode);

  // check if lobby exists
  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  // avoid adding host as normal player
  if (lobby.host.uid === playerData.uid) {
    lobby.host.username = playerData.username;
    lobby.host.socketId = playerData.socketId;
    return { lobby, error: null };
  }

  const existingPlayer = lobby.players.find(
    (player) => player.uid === playerData.uid,
  );

  // check to see if player already exists in lobby
  if (existingPlayer) {
    existingPlayer.socketId = playerData.socketId;
    existingPlayer.username = playerData.username;
    existingPlayer.isConnected = true;
    return { lobby, error: null };
  }

  // push player info
  lobby.players.push({
    uid: playerData.uid,
    username: playerData.username,
    socketId: playerData.socketId,
    token: null,
    position: 0,
    points: 0,
    isConnected: true,
  });
  return { lobby, error: null };
}

export function updatePlayerToken(lobbyCode, uid, token) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  const player = lobby.players.find(
    (currentPlayer) => currentPlayer.uid === uid,
  );

  if (!player) {
    return { lobby, error: "Player not found" };
  }

  const tokenTaken = lobby.players.some(
    (currentPlayer) =>
      currentPlayer.uid !== uid && currentPlayer.token === token,
  );

  if (tokenTaken) {
    return { lobby, error: "Token already taken" };
  }
  player.token = token;
  return { lobby, error: null };
}

export function startGame(lobbyCode, hostUid, options = {}) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  if (options.edition) {
    lobby.edition = options.edition;
  }

  if (typeof options.startingPoints === "number") {
    lobby.edition = {
      ...lobby.edition,
      startingPoints: options.startingPoints,
    };
  }

  if (lobby.host.uid !== hostUid) {
    return { lobby, error: "Only the host can start the game" };
  }

  if (lobby.players.length === 0) {
    return { lobby, error: "Cannot start a game with no players" };
  }

  lobby.status = "playing";
  lobby.currentTurnUid = lobby.players[0].uid ?? null;
  lobby.lastRoll = null;
  lobby.winnerUid = null;

  lobby.players.forEach((player) => {
    player.position = 0;
    player.points = lobby.edition.startingPoints ?? 0;
  });
  return { lobby, error: null };
}

export function rollDice(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  if (lobby.status !== "playing") {
    return { lobby, error: "Game is not currently active" };
  }

  // return if not current player (with the exception of host for host force roll control)
  if (lobby.currentTurnUid !== uid && lobby.host.uid !== uid) {
    return { lobby, error: "It is not your turn" };
  }

  const player = lobby.players.find(
    (currentPlayer) => currentPlayer.uid === lobby.currentTurnUid,
  );

  if (!player) {
    return { lobby, error: "Player not found" };
  }

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  const tileCount = lobby.edition.tiles.length;

  const previousPosition = player.position;

  const nextPosition = player.position + diceRoll;
  const passedStart = nextPosition >= tileCount;

  player.position = nextPosition % tileCount;

  const landedTile = lobby.edition.tiles[player.position];

  if (typeof landedTile?.points === "number") {
    player.points += landedTile.points;
  }

  lobby.lastRoll = diceRoll;

  if (passedStart) {
    lobby.status = "finished";
    lobby.winnerUid = player.uid;
    lobby.currentTurnUid = null;

    return { lobby, error: null };
  }

  const currentTurnIndex = lobby.players.findIndex(
    (player) => player.uid === lobby.currentTurnUid,
  );
  const nextTurnIndex = (currentTurnIndex + 1) % lobby.players.length;
  lobby.currentTurnUid = lobby.players[nextTurnIndex]?.uid ?? null;

  return { lobby, error: null };
}

export function forceSkipTurn(lobbyCode) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  if (lobby.status !== "playing") {
    return { lobby, error: "Game is not currently active" };
  }

  const currentTurnIndex = lobby.players.findIndex(
    (player) => player.uid === lobby.currentTurnUid,
  );
  const nextTurnIndex = (currentTurnIndex + 1) % lobby.players.length;
  lobby.currentTurnUid = lobby.players[nextTurnIndex]?.uid ?? null;

  return { lobby, error: null };
}

export function kickPlayer(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { error: "Lobby not found" };
  }

  if (lobby.players.length <= 2) {
    return { error: "Cannot remove player. Minimum 2 players required." };
  }

  const isCurrentTurn = lobby.currentTurnUid === uid;

  if (isCurrentTurn) {
    const kickedIndex = lobby.players.findIndex((player) => player.uid === uid);
    lobby.players = lobby.players.filter((player) => player.uid !== uid);
    
    if (lobby.players.length > 0) {
      const nextTurnIndex = kickedIndex % lobby.players.length;
      lobby.currentTurnUid = lobby.players[nextTurnIndex]?.uid ?? null;
    } else {
      lobby.currentTurnUid = null;
    }
  } else {
    lobby.players = lobby.players.filter((player) => player.uid !== uid);
  }

  return { lobby, error: null };
}

export function disconnectPlayer(socketId) {
  for (const lobby of Object.values(lobbies)) {
    if (lobby.host.socketId === socketId) {
      lobby.host.socketId = null;
    }

    const player = lobby.players.find(
      (currentPlayer) => currentPlayer.socketId === socketId,
    );

    if (player) {
      player.socketId = null;
      player.isConnected = false;
      return { lobby, error: null };
    }
  }
  return { lobby: null, error: "Socket not found" };
}
