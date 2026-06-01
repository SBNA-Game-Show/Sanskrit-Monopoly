export const lobbies = {};

const TOKEN_EMOJI = {
  boat: "🚢",
  cat: "🐈",
  shoe: "👟",
  dog: "🐕",
};

export function generateLobbyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function createLobby(hostUid, hostUsername) {
  const lobbyCode = generateLobbyCode();

  lobbies[lobbyCode] = {
    lobbyCode,
    status: "waiting",
    players: [],
    host: {
      uid: hostUid,
      username: hostUsername || "Host",
      socketId: null,
    },
    game: null,
  };

  return lobbies[lobbyCode];
}

export function getLobby(lobbyCode) {
  return lobbies[lobbyCode];
}

export function getTotalPlayers(lobby) {
  return lobby?.players?.length || 0;
}

export function canStartGame(lobby) {
  const playerCount = getTotalPlayers(lobby);
  return playerCount >= 2 && playerCount <= 4;
}

export function startGame(lobbyCode, selectedEdition = "TEMPLE", startingMoney = 500, playerTokens = []) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { error: "Lobby not found." };
  }

  if (!canStartGame(lobby)) {
    return { error: "Game needs minimum 2 players and maximum 4 players." };
  }

  const fallbackTokens = ["🐘", "👟", "🐕", "🚢"];

  const gamePlayers = lobby.players.slice(0, 4).map((player, index) => {
    const tokenId = playerTokens[index];
    const token = TOKEN_EMOJI[tokenId] || fallbackTokens[index] || "🪙";

    return {
      id: index + 1,
      uid: player.uid || null,
      username: player.username || `Player ${index + 1}`,
      socketId: player.socketId || null,
      money: Number(startingMoney) || 500,
      score: 0,
      position: 0,
      status: "Active",
      token,
      properties: 0,
    };
  });

  lobby.status = "playing";
  lobby.game = {
    selectedEdition,
    startingMoney: Number(startingMoney) || 500,
    players: gamePlayers,
    currentPlayerIndex: 0,
    diceResult: null,
    tileLanded: "आरम्भः",
    lastAction: "Game started.",
    lastEffect: "start",
    turnNumber: 1,
  };

  return { lobby };
}

function getTileEffect(position) {
  if (position === 0) {
    return {
      type: "start",
      title: "आरम्भः",
      scoreChange: 0,
      message: "Start tile.",
    };
  }

  if (position % 3 === 0) {
    return {
      type: "reward",
      title: "पुरस्कारः",
      scoreChange: 100,
      message: "Reward tile: +100 points.",
    };
  }

  if (position % 2 === 0) {
    return {
      type: "penalty",
      title: "दण्डः / शब्द-परीक्षा",
      scoreChange: -50,
      message: "Penalty tile: -50 points.",
    };
  }

  return {
    type: "safe",
    title: "सुरक्षित-स्थानम्",
    scoreChange: 0,
    message: "Safe tile. No point change.",
  };
}

export function rollDice(lobbyCode, socketId, options = {}) {
  const lobby = getLobby(lobbyCode);

  if (!lobby || !lobby.game) {
    return { error: "Game not found." };
  }

  const game = lobby.game;
  const currentPlayer = game.players[game.currentPlayerIndex];
  const isHost = lobby.host?.socketId === socketId;
  const isCurrentPlayer = currentPlayer?.socketId === socketId;

  if (!options.force && !isHost && !isCurrentPlayer) {
    return { error: "It is not your turn." };
  }

  const dice = Math.floor(Math.random() * 6) + 1;
  const newPosition = (currentPlayer.position + dice) % 40;
  const effect = getTileEffect(newPosition);

  const updatedPlayer = {
    ...currentPlayer,
    position: newPosition,
    score: currentPlayer.score + effect.scoreChange,
  };

  game.players = game.players.map((player, index) =>
    index === game.currentPlayerIndex ? updatedPlayer : player
  );

  game.diceResult = dice;
  game.tileLanded = effect.title;
  game.lastEffect = effect.type === "reward" || effect.type === "penalty" ? effect.type : "safe";
  game.lastAction = `${currentPlayer.username} rolled ${dice}. ${effect.message}`;
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  game.turnNumber += 1;

  return { lobby };
}

export function nextTurn(lobbyCode) {
  const lobby = getLobby(lobbyCode);

  if (!lobby || !lobby.game) {
    return { error: "Game not found." };
  }

  const game = lobby.game;
  const oldPlayer = game.players[game.currentPlayerIndex];
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  game.lastAction = `${oldPlayer?.username || "Player"}'s turn was skipped.`;
  game.turnNumber += 1;

  return { lobby };
}

export function adjustPlayerScore(lobbyCode, playerId, amount) {
  const lobby = getLobby(lobbyCode);

  if (!lobby || !lobby.game) {
    return { error: "Game not found." };
  }

  const value = Number(amount) || 0;

  lobby.game.players = lobby.game.players.map((player) =>
    player.id === Number(playerId)
      ? { ...player, score: player.score + value }
      : player
  );

  lobby.game.lastAction = `Admin adjusted Player ${playerId} score by ${value}.`;

  return { lobby };
}

export function removeGamePlayer(lobbyCode, playerId) {
  const lobby = getLobby(lobbyCode);

  if (!lobby || !lobby.game) {
    return { error: "Game not found." };
  }

  if (lobby.game.players.length <= 2) {
    return { error: "Cannot remove player. Minimum 2 players required." };
  }

  lobby.game.players = lobby.game.players.filter((player) => player.id !== Number(playerId));

  if (lobby.game.currentPlayerIndex >= lobby.game.players.length) {
    lobby.game.currentPlayerIndex = 0;
  }

  lobby.game.lastAction = `Admin removed Player ${playerId}.`;

  return { lobby };
}

export function handlePlayerAction(lobbyCode, socketId, action) {
  const lobby = getLobby(lobbyCode);

  if (!lobby || !lobby.game) {
    return { error: "Game not found." };
  }

  const playerIndex = lobby.game.players.findIndex((player) => player.socketId === socketId);

  if (playerIndex === -1) {
    return { error: "Player not found in this game." };
  }

  let message = "Action completed.";

  lobby.game.players = lobby.game.players.map((player, index) => {
    if (index !== playerIndex) return player;

    if (action === "buy-property") {
      message = `${player.username} bought a property.`;
      return {
        ...player,
        money: Math.max(0, player.money - 100),
        properties: player.properties + 1,
      };
    }

    if (action === "collect-rent") {
      message = `${player.username} collected rent.`;
      return {
        ...player,
        money: player.money + 75,
      };
    }

    if (action === "chance") {
      message = `${player.username} received a chance bonus.`;
      return {
        ...player,
        score: player.score + 50,
      };
    }

    return player;
  });

  lobby.game.lastAction = message;

  return { lobby };
}
