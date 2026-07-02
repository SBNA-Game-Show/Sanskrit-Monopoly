import { DEFAULT_EDITION } from "../../shared/defaultEdition.js";
import { QUIZ_QUESTIONS } from "../../shared/quizQuestions.js";
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from "../constants/game.js";

export const lobbies = {};

export function generateLobbyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function getLobby(lobbyCode) {
  return lobbies[lobbyCode] ?? null;
}

export function addLog(lobbyCode, entry) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { error: "Lobby not found" };
  }

  const logEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...entry,
  };

  lobby.log.push(logEntry);
  return { lobby, error: null };
}

// helper function for quiz questions
const POP_QUIZ_DURATION_MS = 15000;

function getRandomQuizQuestion(questions) {
  const index = Math.floor(Math.random() * questions.length);
  return questions[index];
}

function createActiveQuiz(questions) {
  const question = getRandomQuizQuestion(questions);

  return {
    id: `quiz-${Date.now()}`,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    status: "answering",
    endsAt: Date.now() + POP_QUIZ_DURATION_MS,
  };
}

// helper function for auctioning
function createActiveAuction(tile) {
  return {
    tileId: tile.id,
    highestBid: 0,
    highestBidderUid: null,
  };
}

function getEligibleAuctionBidders(lobby, minimumBid = 1) {
  // only real active players with enough money count as auction competitors
  return lobby.players.filter(
    (player) =>
      !player.isEliminated &&
      !player.isBankrupt &&
      player.money >= minimumBid,
  );
}

function getRandomChanceCard() {
  const index = Math.floor(Math.random() * CHANCE_CARDS.length);
  return CHANCE_CARDS[index];
}
function getRandomCommunityChestCard() {
  const index = Math.floor(Math.random() * COMMUNITY_CHEST_CARDS.length);
  return COMMUNITY_CHEST_CARDS[index];
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
  //rn the admin page saves the price as a string instead of a number
  //fix later
  return Number(tile.price);

  // if (typeof tile?.price === "number") return tile.price;

  // if (tile?.type === "railroad") return 200;
  // if (tile?.type === "utility") return 150;

  // return 100;
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

  return Number(tile.rent)
}

// ---- bankruptcy related helper functions
function updateBankruptcyStatus(player) {
  player.isBankrupt = player.money < 0; // player considered bankrupt if money drops below zero
}

function setBankruptcyActionIfNeeded(lobby, player) {
  updateBankruptcyStatus(player);

  // continue if player recovered from bankruptcy or never went negative
  if (!player.isBankrupt) {
    return false;
  }

  lobby.gameStatus = "bankruptcy"; // pause normal turn flow until bankruptcy is resolved

  addLog(lobby.lobbyCode, {
    uid: player.uid,
    username: player.username,
    message: "is below ₩0 and needs bankruptcy resolution.",
  });

  return true;
}

// called when player self-declares as bankrupt
// reuses eliminiation logic (until selling is implemented)
export function declareBankruptcy(lobbyCode, uid) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  if (lobby.gameStatus !== "bankruptcy") {
    return { lobby, error: "No bankruptcy is pending" };
  }

  const bankruptPlayer = lobby.players.find((player) => player.uid === uid);

  if (!bankruptPlayer) {
    return { lobby, error: "Player not found" };
  }

  if (!bankruptPlayer.isBankrupt) {
    return { lobby, error: "This player is not bankrupt" };
  }

  // Selling assets will eventually happen before this point.
  // Until then, declaring bankruptcy means elimination.
  return resolveBankruptcy(lobbyCode, lobby.host.uid, uid);
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

export function applyCardEffect(lobby, player, card) {
  switch (card.effect) {
    case "goToJail": {
      const jailIndex = lobby.edition.tiles.findIndex(
        (tile) => tile.type === "jail",
      );
      if (jailIndex !== -1) {
        player.position = jailIndex;
        player.jailed = true;
        lobby.gameStatus = "jail";
      }

      break;
    }

    case "goBack3":
      const totalTiles = lobby.edition.tiles.length;
      player.position = (player.position - 3 + totalTiles) % totalTiles;
      break;

    case "advanceToGo":
      player.position = 0;
      player.money += card.points;
      break;

    case "money":
      player.money += card.points;
      break;

    default:
      if (typeof card.points === "number") {
        player.money += card.points;
      }
      break;
  }
}


// ***************************************************************
// ****************** MONOPOLY GAME LOGIC HELPERS ****************
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

  if (landedTile.type === "goToJail") {
    const jailIndex = lobby.edition.tiles.findIndex(
      (tile) => tile.type === "jail",
    );

    currentPlayer.position = jailIndex;
    currentPlayer.jailed = true;

    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: `went to jail.`,
    });

    lobby.gameStatus = "jail";

    return { lobby, error: null };
  }

  if (landedTile.type === "chance") {
    lobby.gameStatus = "chance";
    const randomCard = getRandomChanceCard();
    lobby.activeCard = randomCard;


    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message:
        randomCard.points === 0
          ? `drew a chance card: ${randomCard.title}.`
          : `drew a chance card and ${randomCard.points > 0 ? "received" : "lost"
          } ₩${Math.abs(randomCard.points)}.`,
    });

    return { lobby, error: null };
  }

  if (landedTile.type === "community") {
    lobby.gameStatus = "community";
    const randomCard = getRandomCommunityChestCard();
    lobby.activeCard = randomCard;


    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message:
        randomCard.points === 0
          ? `drew a community chest card: ${randomCard.title}.`
          : `drew a community chest card and ${randomCard.points > 0 ? "received" : "lost"
          } ₩${Math.abs(randomCard.points)}.`,
    });

    return { lobby, error: null };
  }

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

  if (landedTile.type === "quiz") {
    lobby.gameStatus = "popQuiz";
    lobby.activeQuiz = createActiveQuiz(lobby.edition.questions);
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
    lobby.gameStatus = "buyProperty";

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
export function createLobby(hostUid, hostUsername, isPrivate = false, edition = DEFAULT_EDITION) {
  const lobbyCode = generateLobbyCode();

  lobbies[lobbyCode] = {
    lobbyCode: lobbyCode,
    isPrivate: isPrivate,
    status: "waiting",
    gameStatus: null, // null since game hasn't started
    activeQuiz: null, // here he is
    activeAuction: null,
    gameTimer: null, // timer for MINIGAMES ONLY, holds reference to timer so we can clearTimeout if needed
    activeCard: null,
    players: [],
    host: { uid: hostUid, username: hostUsername, socketId: null },
    edition,
    currentPlayerIndex: 0,
    lastRoll: null,
    winnerUid: null,
    startTime: null,
    endTime: null,
    log: [],
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
    jailed: false,
    isConnected: true,
    isBankrupt: false,
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

  if (options.tiles && options.questions) {
    lobby.edition = {
      startingPoints: options.startingPoints,
      tiles: options.tiles,
      questions: options.questions,
    };
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
  lobby.activeAuction = null;
  lobby.activeCard = null;
  lobby.lastRoll = null;
  lobby.winnerUid = null;
  lobby.startTime = Date.now();
  lobby.endTime = null;

  // reset all player parameters (position, points, money, etc)
  lobby.players.forEach((player) => {
    player.position = 0;
    player.points = lobby.edition.startingPoints ?? 0;
    player.money = lobby.edition.startingPoints ?? 1500;
    player.properties = [];
    player.isBankrupt = false;
    player.isEliminated = false;
  });

  addLog(lobbyCode, {
    uid: lobby.players[lobby.currentPlayerIndex].uid,
    username: lobby.players[lobby.currentPlayerIndex].username,
    message: "started their turn.",
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

  if (lobby.status !== "playing") {
    return { lobby, error: "Game is not currently active" };
  }

  if (lobby.gameStatus !== "idling") {
    return { lobby, error: "Resolve the current action before rolling again" };
  }

  // block unresolved bankruptcy
  const bankruptPlayer = lobby.players.find((player) => player.isBankrupt);

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

  addLog(lobbyCode, {
    uid: currentPlayer.uid,
    username: currentPlayer.username,
    message: `rolled a ${diceRoll}.`,
  });

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

  if (lobby.gameStatus !== "buyProperty") {
    return { lobby, error: "No property purchase is pending" };
  }

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  if (!currentPlayer) {
    return { lobby, error: "Current player not found" };
  }

  if (currentPlayer.uid !== uid) {
    return { lobby, error: "Only the landing player can buy this property" };
  }

  const tile = lobby.edition.tiles[currentPlayer.position];

  const player = lobby.players.find(
    (currentPlayer) => currentPlayer.uid === uid,
  );

  if (!player) {
    return { lobby, error: "Player not found" };
  }

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

  if (lobby.gameStatus !== "buyProperty") {
    return { lobby, error: "No property purchase is pending" };
  }

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  if (!currentPlayer) {
    return { lobby, error: "Current player not found" };
  }

  if (currentPlayer.uid !== uid) {
    return {
      lobby,
      error: "Only the landing player can decline this property",
    };
  }

  const tile = lobby.edition.tiles[currentPlayer.position];

  if (!tile || !isBuyableTile(tile)) {
    return { lobby, error: "This tile cannot be purchased" };
  }

  const existingOwner = findTileOwner(lobby, tile.id);

  if (existingOwner) {
    return { lobby, error: "This property is already owned" };
  }

  const eligibleBidders = getEligibleAuctionBidders(lobby);

  // skip auction if less than 2 players can bid
  // property stays unowned and turn ends
  if (eligibleBidders.length < 2) {
    addLog(lobby.lobbyCode, {
      uid,
      username: currentPlayer.username,
      message: `declined to buy ${tile.name}. Not enough players could bid, so no auction started.`,
    });

    lobby.activeAuction = null;
    lobby.gameStatus = "turnEnded";

    return { lobby, error: null };
  }

  // start auction for property the player declined
  lobby.activeAuction = createActiveAuction(tile);
  lobby.gameStatus = "auction";

  addLog(lobby.lobbyCode, {
    uid,
    username: currentPlayer.username,
    message: `declined to buy ${tile.name}. Auction started.`,
  });

  return { lobby, error: null };
}

export function sellProperty(lobbyCode, uid, propertyId) {
  const lobby = getLobby(lobbyCode);

  if (!lobby) {
    return { lobby: null, error: "Lobby not found" };
  }

  if (lobby.status !== "playing") {
    return { lobby, error: "Game is not currently active" };
  }

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  if (!currentPlayer) {
    return { lobby, error: "Current player not found" };
  }

  if (currentPlayer.uid !== uid) {
    return { lobby, error: "You can only sell property on your turn" };
  }

  const allowedStatuses = ["idling", "buyProperty"];

  if (!allowedStatuses.includes(lobby.gameStatus)) {
    return {
      lobby,
      error: "You can only sell before rolling dice or while deciding to buy a property",
    };
  }

  const player = lobby.players.find((currentPlayer) => currentPlayer.uid === uid);

  if (!player) {
    return { lobby, error: "Player not found" };
  }

  if (!player.properties.includes(propertyId)) {
    return { lobby, error: "You do not own this property" };
  }

  const tile = lobby.edition.tiles.find(
    (currentTile) => currentTile.id === propertyId,
  );

  if (!tile || !isBuyableTile(tile)) {
    return { lobby, error: "This property cannot be sold" };
  }

  const sellValue = Number(tile.sellValue);

  player.properties = player.properties.filter(
    (currentPropertyId) => currentPropertyId !== propertyId,
  );

  player.money += sellValue;
  updateBankruptcyStatus(player);

  addLog(lobby.lobbyCode, {
    uid: player.uid,
    username: player.username,
    message: `sold ${tile.name} for ₩${sellValue}.`,
  });

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

  if (lobby.gameStatus !== "bankruptcy") {
    return { lobby, error: "No bankruptcy resolution is pending" };
  }

  const bankruptPlayer = lobby.players.find(
    (player) => player.uid === bankruptPlayerUid,
  );

  if (!bankruptPlayer) {
    return { lobby, error: "Bankrupt player not found" };
  }

  if (!bankruptPlayer.isBankrupt) {
    return { lobby, error: "This player is not bankrupt" };
  }

  const releasedProperties = bankruptPlayer.properties;

  bankruptPlayer.isEliminated = true;
  bankruptPlayer.isBankrupt = false;
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

// set amount of money that can be bid
const AUCTION_BID_INCREMENTS = [1, 5, 10, 25];

// function that dictates how placing bids in an auction works
export function placeAuctionBid(lobbyCode, uid, bidIncrement) {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return { lobby: null, error: "Lobby not found" };

  // only accept bids during an active auction
  if (lobby.gameStatus !== "auction" || !lobby.activeAuction) {
    return { lobby, error: "No auction is active" };
  }

  const player = lobby.players.find((currentPlayer) => currentPlayer.uid === uid);
  
  // block bankrupt/eliminated players from auctioning
  if (!player || player.isEliminated || player.isBankrupt) {
    return { lobby, error: "Player not found" };
  }

  // incremental bidding so it's easier to click
  const increment = Number(bidIncrement);

  // only allow the fixed Monopoly-style bid buttons
  if (!AUCTION_BID_INCREMENTS.includes(increment)) {
    return { lobby, error: "Invalid bid increment" };
  }

  // avoid players accidentally bidding against themself
  if (lobby.activeAuction.highestBidderUid === uid) {
    return { lobby, error: "You are already the highest bidder" };
  }

  // new bid is current highest bid plus clicked increment
  const bid = lobby.activeAuction.highestBid + increment;

  // prevent player from bidding higher than amount of money they have
  if (player.money < bid) {
    return { lobby, error: "Not enough money for that bid" };
  }

  lobby.activeAuction.highestBid = bid;
  lobby.activeAuction.highestBidderUid = uid;

  addLog(lobby.lobbyCode, {
    uid,
    username: player.username,
    message: `bid ₩${bid} in the auction.`,
  });

  return { lobby, error: null };
}

// function that dictates what to do when an auction ends
export function resolveAuction(lobbyCode, hostUid) {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return { lobby: null, error: "Lobby not found" };

  // Host resolves auction manually (for now)
  if (lobby.host.uid !== hostUid) {
    return { lobby, error: "Only the host can resolve auctions" };
  }

  // check if an auction is currently active
  if (lobby.gameStatus !== "auction" || !lobby.activeAuction) {
    return { lobby, error: "No auction is active" };
  }

  const auction = lobby.activeAuction;
  const tile = lobby.edition.tiles.find((currentTile) => currentTile.id === auction.tileId);
  
  if (!tile) return { lobby, error: "Auction tile not found" };

  const winner = auction.highestBidderUid
    ? lobby.players.find((player) => player.uid === auction.highestBidderUid)
    : null;

  if (winner) {

    // defensive check in case winner's money changed after bidding
    if (winner.money < auction.highestBid) {
      return { lobby, error: "Winning bidder can no longer afford the bid" };
    }

    // winner pays their bid then receives auctioned property
    winner.money -= auction.highestBid;
    winner.properties.push(tile.id);

    // current rules prevent this from being true (overbidding is blocked... for now)
    updateBankruptcyStatus(winner);
    
    addLog(lobby.lobbyCode, {
      uid: winner.uid,
      username: winner.username,
      message: `won ${tile.name} at auction for ₩${auction.highestBid}.`,
    });
  } else {
    addLog(lobby.lobbyCode, {
      uid: lobby.host.uid,
      username: lobby.host.username,
      message: `${tile.name} received no auction bids.`,
    });
  }

  lobby.activeAuction = null;
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
  const nextTurnIndex = getNextActivePlayerIndex(
    lobby,
    lobby.currentPlayerIndex,
  );

  if (nextTurnIndex === -1) {
    return;
  }

  lobby.currentPlayerIndex = nextTurnIndex;
  lobby.gameStatus = "startOfTurn";
  addLog(lobby.lobbyCode, {
    uid: lobby.players[lobby.currentPlayerIndex].uid,
    username: lobby.players[lobby.currentPlayerIndex].username,
    message: "started their turn.",
  });
  broadcastGameState(io, lobby);

  // change to idling after 2.5 seconds to make startOfTurn overlay disappear
  setTimeout(() => {
    const currentPlayer = lobby.players[lobby.currentPlayerIndex];
    lobby.gameStatus = currentPlayer.jailed ? "jail" : "idling";
    broadcastGameState(io, lobby);
  }, 2000);
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

export function updateLobbyEdition(lobbyCode, editionName) {
  const lobby = getLobby(lobbyCode);
  
  if (lobby) {
    if (!lobby.edition) {
      lobby.edition = {};
    }
    // Update the name so the API endpoint picks it up instantly
    lobby.edition.name = editionName; 
  }
  
  return { lobby, error: null };
}
