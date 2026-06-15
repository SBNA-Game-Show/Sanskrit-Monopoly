import { DEFAULT_EDITION } from "../../shared/defaultEdition.js";
import { QUIZ_QUESTIONS } from "../../shared/quizQuestions.js";

export const lobbies = {};

export function generateLobbyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function getLobby(lobbyCode) {
  return lobbies[lobbyCode] ?? null;
}

// helper function for quiz questions
const POP_QUIZ_DURATION_MS = 15000;

function getRandomQuizQuestion() {
  const index = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
  return QUIZ_QUESTIONS[index];
}

function createActiveQuiz() {
  const question = getRandomQuizQuestion();

  return {
    id: `quiz-${Date.now()}`,
    question: question.question,
    options: question.options,
    correctOptionId: question.correctOptionId,
    answers: {},
    status: "answering",
    endsAt: Date.now() + POP_QUIZ_DURATION_MS,
  };
}

// ***************************************************************
// ****************** MONOPOLY GAME LOGIC BELOW ******************
// ***************************************************************

const PASS_START_BONUS = 200;

function isBuyableTile(tile) {
  return (
    tile?.type === "property" ||
    tile?.type === "railroad" ||
    tile?.type === "utility"
  );
}

function findTileOwner(lobby, tileId) {
  return (
    lobby.players.find((player) => player.properties.includes(tileId)) ?? null
  );
}

function getTilePrice(tile) {
  if (typeof tile?.price === "number") return tile.price;

  if (tile?.type === "railroad") return 200;
  if (tile?.type === "utility") return 150;

  return 100;
}

function getTaxAmount(tile) {
  if (typeof tile?.amount === "number") return tile.amount;

  if (tile?.id === "tile-4") return 200;
  if (tile?.id === "tile-38") return 100;

  return 100;
}

function getOwnedTileCountByType(lobby, owner, tileType) {
  return owner.properties.filter((tileId) => {
    const ownedTile = lobby.edition.tiles.find((tile) => tile.id === tileId);
    return ownedTile?.type === tileType;
  }).length;
}

function getRentAmount(lobby, tile, owner, diceRoll) {
  if (!tile || !owner) return 0;

  if (tile.type === "railroad") {
    const railroadCount = getOwnedTileCountByType(lobby, owner, "railroad");
    return [0, 25, 50, 100, 200][railroadCount] ?? 25;
  }

  if (tile.type === "utility") {
    const utilityCount = getOwnedTileCountByType(lobby, owner, "utility");
    return diceRoll * (utilityCount >= 2 ? 10 : 4);
  }

  return typeof tile.rent === "number" ? tile.rent : 10;
}

function createBuyPropertyAction(player, tile) {
  const price = getTilePrice(tile);

  return {
    type: "buyProperty",
    playerUid: player.uid,
    tileId: tile.id,
    tileName: tile.name,
    price,
    canAfford: player.money >= price,
  };
}

// ---- bankruptcy related helper functions
function updateBankruptcyStatus(player) {
  player.needsBankruptcyResolution = player.money < 0;
}

function createBankruptcyAction(player) {
  return {
    type: "bankruptcy",
    playerUid: player.uid,
    playerName: player.username,
    money: player.money,
  };
}

function setBankruptcyActionIfNeeded(lobby, player) {
  updateBankruptcyStatus(player);

  if (!player.needsBankruptcyResolution) {
    return false;
  }

  lobby.pendingAction = createBankruptcyAction(player);
  addLog(lobby.lobbyCode, {
    uid: player.uid,
    username: player.username,
    message: "is below ₩0 and needs bankruptcy resolution.",
  });

  return true;
}

// ----- active player-related helpers
function getActivePlayers(lobby) {
  return lobby.players.filter((player) => !player.isEliminated);
}

function getNextActivePlayerIndex(lobby, fromIndex) {
  if (lobby.players.length === 0) return -1;

  for (let offset = 1; offset <= lobby.players.length; offset += 1) {
    const nextIndex = (fromIndex + offset) % lobby.players.length;
    const nextPlayer = lobby.players[nextIndex];

    if (nextPlayer && !nextPlayer.isEliminated) {
      return nextIndex;
    }
  }

  return -1;
}

// ***************************************************************
// ****************** MONOPOLY GAME LOGIC HELPERINOES ************
// ***************************************************************

export function resolveLandingAction(lobby) {
  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  if (!currentPlayer) {
    return { lobby, error: "Current player not found" };
  }

  const landedTile = lobby.edition.tiles[currentPlayer.position];

  if (!landedTile) {
    return { lobby, error: "Landed tile not found" };
  }

  lobby.pendingAction = null;

  // check if player landed on tax tile
  if (landedTile.type === "tax") {
    const taxAmount = getTaxAmount(landedTile);
    currentPlayer.money -= taxAmount;

    const wentBankrupt = setBankruptcyActionIfNeeded(lobby, currentPlayer);

    // charge tax if player is not currently bankrupt
    if (!wentBankrupt) {
      addLog(lobby.lobbyCode, {
        uid: currentPlayer.uid,
        username: currentPlayer.username,
        message: `paid ₩${taxAmount} tax on ${landedTile.name}.`,
      });
    }

    return { lobby, error: null };
  }

  if (!isBuyableTile(landedTile)) {
    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: `landed on ${landedTile.name}.`,
    });

    return { lobby, error: null };
  }

  const owner = findTileOwner(lobby, landedTile.id);

  if (!owner) {
    lobby.pendingAction = createBuyPropertyAction(currentPlayer, landedTile);

    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: `can buy ${landedTile.name}.`,
    });

    return { lobby, error: null };
  }

  // check if current player landed on their own property
  if (owner.uid === currentPlayer.uid) {
    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: `landed on their own property: ${landedTile.name}.`,
    });

    return { lobby, error: null };
  }

  const rentAmount = getRentAmount(
    lobby,
    landedTile,
    owner,
    lobby.lastRoll ?? 0,
  );

  currentPlayer.money -= rentAmount;
  owner.money += rentAmount;

  updateBankruptcyStatus(owner);
  const wentBankrupt = setBankruptcyActionIfNeeded(lobby, currentPlayer);

  // collect rent if player is not currently bankrupt
  if (!wentBankrupt) {
    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: `paid ₩${rentAmount} rent to ${owner.username} for ${landedTile.name}.`,
    });
  }

  return { lobby, error: null };
}

// ***************************************************************
// ***** VISUAL DISTINCTION TO MAKE IT EASIER TO TELL ************
// ***************************************************************

export function showQuiz(lobbyCode) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { error: "Lobby not found" };
  }

  lobby.gameStatus = "popQuiz";
  lobby.activeQuiz = createActiveQuiz();
  return { lobby, error: null };
}

export function showMiniGame(lobbyCode) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { error: "Lobby not found" };
  }

  lobby.gameStatus = "miniGame";
  return { lobby, error: null };
}

// function to create lobby
export function createLobby(hostUid, hostUsername, edition = DEFAULT_EDITION) {
  const lobbyCode = generateLobbyCode();

  lobbies[lobbyCode] = {
    lobbyCode: lobbyCode,
    status: "waiting",
    gameStatus: null, // null since game hasn't started
    activeQuiz: null, // here he is
    pendingAction: null,
    players: [],
    host: { uid: hostUid, username: hostUsername, socketId: null },
    edition,
    currentPlayerIndex: 0,
    lastRoll: null,
    winnerUid: null,
    startTime: null,
    endTime: null,
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
    money: 0, // <- implemented
    properties: [], // <- implemented
    isConnected: true,
    needsBankruptcyResolution: false,
    isEliminated: false,
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

  // players must pick a token for game to proceed
  const playersWithoutTokens = lobby.players.filter((player) => !player.token);

  if (playersWithoutTokens.length > 0) {
    return {
      lobby,
      error: "All players must select a token before starting the game",
    };
  }

  lobby.status = "playing";
  lobby.gameStatus = "startOfTurn"; // show start of turn overlay for 1st player when starting game
  lobby.activeQuiz = null;
  lobby.lastRoll = null;
  lobby.winnerUid = null;
  lobby.pendingAction = null;
  lobby.startTime = Date.now();
  lobby.endTime = null;

  // reset all player parameters (position, points, money, etc)
  lobby.players.forEach((player) => {
    player.position = 0;
    player.points = lobby.edition.startingPoints ?? 0;
    player.money = lobby.edition.startingPoints ?? 1500;
    player.properties = [];
    player.needsBankruptcyResolution = false;
    player.isEliminated = false;
  });
  return { lobby, error: null };
}

export function rollDice(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  // dissalow eliminated player from rolling dice
  if (!currentPlayer || currentPlayer.isEliminated) {
    return { lobby, error: "Current player is eliminated" };
  }

  // DEV ONLY: force near tax tiles for faster bankruptcy testing
  // REMOVE / COMMENT OUT before normal playtesting
  currentPlayer.position = 3;

  if (lobby.status !== "playing") {
    return { lobby, error: "Game is not currently active" };
  }

  // pending action guard
  if (lobby.pendingAction) {
    return { lobby, error: "Resolve the current action before rolling again" };
  }

  // block unresolved bankruptcy
  const bankruptPlayer = lobby.players.find(
    (player) => player.needsBankruptcyResolution,
  );

  if (bankruptPlayer) {
    return {
      lobby,
      error: `${bankruptPlayer.username} needs bankruptcy resolution before the game can continue`,
    };
  }

  // return if not current player (with the exception of host for host force roll control)
  if (currentPlayer.uid !== uid && lobby.host.uid !== uid) {
    return { lobby, error: "It is not your turn" };
  }

  const rollingPlayer = lobby.players.find((player) => player.uid === uid);

  // check if currently rolling player is eliminated
  if (rollingPlayer?.isEliminated) {
    return { lobby, error: "Eliminated players cannot roll" };
  }

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  const tileCount = lobby.edition.tiles.length;

  const previousPosition = currentPlayer.position;

  const nextPosition = currentPlayer.position + diceRoll;
  const passedStart = nextPosition >= tileCount;

  currentPlayer.position = nextPosition % tileCount;

  const landedTile = lobby.edition.tiles[currentPlayer.position];

  if (typeof landedTile?.points === "number") {
    currentPlayer.points += landedTile.points;
  }

  lobby.lastRoll = diceRoll;
  lobby.gameStatus = "rollingDice"; //play token moving animation or dice roll animation here

  // if player passes start, award (arbitrary) money
  if (passedStart) {
    currentPlayer.money += PASS_START_BONUS;
    updateBankruptcyStatus(currentPlayer);

    addLog(lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: `collected ₩${PASS_START_BONUS} for passing आरम्भः.`,
    });
  }

  return { lobby, error: null };
}

export function buyPendingProperty(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  const action = lobby.pendingAction;

  if (!action || action.type !== "buyProperty") {
    return { lobby, error: "No property purchase is pending" };
  }

  if (action.playerUid !== uid) {
    return { lobby, error: "Only the landing player can buy this property" };
  }

  const player = lobby.players.find(
    (currentPlayer) => currentPlayer.uid === uid,
  );

  if (!player) {
    return { lobby, error: "Player not found" };
  }

  const tile = lobby.edition.tiles.find(
    (currentTile) => currentTile.id === action.tileId,
  );

  if (!tile || !isBuyableTile(tile)) {
    return { lobby, error: "This tile cannot be purchased" };
  }

  const existingOwner = findTileOwner(lobby, tile.id);

  if (existingOwner) {
    return { lobby, error: "This property is already owned" };
  }

  const price = getTilePrice(tile);

  if (player.money < price) {
    return { lobby, error: "Not enough money to buy this property" };
  }

  player.money -= price;
  player.properties.push(tile.id);
  updateBankruptcyStatus(player);

  lobby.pendingAction = null;
  addLog(lobby.lobbyCode, {
    uid: player.uid,
    username: player.username,
    message: `bought ${tile.name} for ₩${price}.`,
  });
  lobby.gameStatus = "turnEnded";

  return { lobby, error: null };
}

export function declinePendingProperty(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  const action = lobby.pendingAction;

  if (!action || action.type !== "buyProperty") {
    return { lobby, error: "No property purchase is pending" };
  }

  if (action.playerUid !== uid) {
    return {
      lobby,
      error: "Only the landing player can decline this property",
    };
  }

  lobby.pendingAction = null;
  const decliningPlayer = lobby.players.find((player) => player.uid === uid);

  addLog(lobby.lobbyCode, {
    uid,
    username: decliningPlayer?.username ?? "The player",
    message: `declined to buy ${action.tileName}.`,
  });
  lobby.gameStatus = "turnEnded";

  return { lobby, error: null };
}

// bankruptcy resolver function
export function resolveBankruptcy(lobbyCode, hostUid, bankruptPlayerUid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  if (lobby.host.uid !== hostUid) {
    return { lobby, error: "Only the host can resolve bankruptcy" };
  }

  const action = lobby.pendingAction;

  if (!action || action.type !== "bankruptcy") {
    return { lobby, error: "No bankruptcy resolution is pending" };
  }

  if (action.playerUid !== bankruptPlayerUid) {
    return { lobby, error: "Bankruptcy action does not match this player" };
  }

  const bankruptPlayer = lobby.players.find(
    (player) => player.uid === bankruptPlayerUid,
  );

  if (!bankruptPlayer) {
    return { lobby, error: "Bankrupt player not found" };
  }

  const releasedProperties = bankruptPlayer.properties;

  bankruptPlayer.isEliminated = true;
  bankruptPlayer.needsBankruptcyResolution = false;
  bankruptPlayer.properties = [];

  lobby.players.forEach((player) => {
    if (player.uid === bankruptPlayerUid) return;

    player.properties = player.properties.filter(
      (tileId) => !releasedProperties.includes(tileId),
    );
  });

  if (lobby.currentPlayerIndex >= lobby.players.length) {
    lobby.currentPlayerIndex = 0;
  }

  lobby.pendingAction = null;

  if (lobby.currentPlayerIndex >= lobby.players.length) {
    lobby.currentPlayerIndex = 0;
  }

  if (lobby.players[lobby.currentPlayerIndex]?.isEliminated) {
    lobby.currentPlayerIndex = getNextActivePlayerIndex(
      lobby,
      lobby.currentPlayerIndex,
    );
  }

  if (lobby.currentPlayerIndex === -1) {
    lobby.currentPlayerIndex = 0;
  }

  addLog(lobby.lobbyCode, {
    uid: bankruptPlayer.uid,
    username: bankruptPlayer.username,
    message: "was eliminated after bankruptcy.",
  });

  // check if only one active player is left
  // end game and declare player as winner
  const activePlayers = getActivePlayers(lobby);

  if (activePlayers.length === 1) {
    const winner = activePlayers[0];

    lobby.status = "finished";
    lobby.gameStatus = "turnEnded";
    lobby.winnerUid = winner.uid;
    lobby.endTime = Date.now();

    addLog(lobby.lobbyCode, {
      uid: winner.uid,
      username: winner.username,
      message: `wins after ${bankruptPlayer.username} was eliminated.`,
    });

    return { lobby, error: null };
  }

  lobby.gameStatus = "turnEnded";

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

  const nextTurnIndex = (lobby.currentPlayerIndex + 1) % lobby.players.length;
  lobby.currentPlayerIndex = nextTurnIndex;

  return { lobby, error: null };
}

export function startNextTurn(lobby, io, broadcastGameState) {
  // show startOfTurn overlay after 2 seconds have passed
  setTimeout(() => {
    const nextTurnIndex = getNextActivePlayerIndex(
      lobby,
      lobby.currentPlayerIndex,
    );

    if (nextTurnIndex === -1) {
      return;
    }

    lobby.currentPlayerIndex = nextTurnIndex;
    lobby.gameStatus = "startOfTurn";
    broadcastGameState(io, lobby);

    // change to idling after 2.5 seconds to make startOfTurn overlay disappear
    setTimeout(() => {
      lobby.gameStatus = "idling";
      broadcastGameState(io, lobby);
    }, 2500);
  }, 3500);
}

export function kickPlayer(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { error: "Lobby not found" };
  }

  if (lobby.players.length <= 2) {
    return { error: "Cannot remove player. Minimum 2 players required." };
  }

  lobby.players = lobby.players.filter((player) => player.uid !== uid);

  if (lobby.currentPlayerIndex >= lobby.players.length) {
    lobby.currentPlayerIndex = 0;
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
