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
    players: [],
    host: { uid: hostUid, username: hostUsername, socketId: null },
    edition,
    currentPlayerIndex: 0,
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
    money: 0, // currently unused
    properties: [], // currently unused
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

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  if (lobby.status !== "playing") {
    return { lobby, error: "Game is not currently active" };
  }

  // return if not current player (with the exception of host for host force roll control)
  if (currentPlayer.uid !== uid && lobby.host.uid !== uid) {
    return { lobby, error: "It is not your turn" };
  }

  const diceRoll = 30; //I PUT THIS AS 30 FOR TESTING PURPOSES TO LAND ON JAIL. CHANGE BACK TO 1-6 WHEN DONE TESTING
  // const diceRoll = Math.floor(Math.random() * 6) + 1;
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

  if (passedStart) {
  lobby.status = "finished";
  lobby.winnerUid = currentPlayer.uid;
  
  return { lobby, error: null, landedTile };
  }

  return { lobby, error: null, landedTile };
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
    const nextTurnIndex = (lobby.currentPlayerIndex + 1) % lobby.players.length;
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

const BAIL_COST = 50;

export function payBail(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return { lobby: null, error: "Lobby not found" };

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];
  if (currentPlayer.uid !== uid) {
    return { lobby, error: "It is not your turn" };
  }
  if (lobby.gameStatus !== "jailDecision") {
    return { lobby, error: "No jail decision pending" };
  }
  if (currentPlayer.points < BAIL_COST) {
    return { lobby, error: "Not enough points to pay bail" };
  }

  currentPlayer.points -= BAIL_COST;
  lobby.gameStatus = "turnEnded";
  return { lobby, error: null };
}

export function sendToJail(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return { lobby: null, error: "Lobby not found" };

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];
  if (currentPlayer.uid !== uid) {
    return { lobby, error: "It is not your turn" };
  }
  if (lobby.gameStatus !== "jailDecision") {
    return { lobby, error: "No jail decision pending" };
  }

  // TODO: actually track "in jail" state (e.g. skip next turn)
  // once PlayerState supports it — for now just resolves the overlay
  lobby.gameStatus = "turnEnded";
  return { lobby, error: null };
}