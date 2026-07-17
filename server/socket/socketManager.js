import { submitScoresToLeaderboard } from "../services/leaderboardService.js";
import {
  addLog,
  getLobby,
  joinLobby,
  updatePlayerToken,
  startGame,
  rollDice,
  showQuiz,
  showMiniGame,
  forceSkipTurn,
  kickPlayer,
  leaveLobby,
  closeLobby,
  disconnectPlayer,
  startNextTurn,
  resolveLandingAction,
  applyCardEffect,
  resolveBankruptcy,
  declareBankruptcy,
  setBankruptcyActionIfNeeded,
  startBankruptcyAuction,
  clearBankruptcyAuctions,
  clearBankruptcyProperty,
  buyPendingProperty,
  declinePendingProperty,
  sellProperty,
  placeAuctionBid,
  resolveAuction,
  lobbies,
  updateLobbyEdition
} from "../services/gameService.js";

import { GAME_EVENTS } from "../../shared/gameEvents.js";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function emitGameError(socket, message) {
  socket.emit(GAME_EVENTS.GAME_ERROR, { message });
}

function broadcastGameState(io, lobby) {
  io.to(lobby.lobbyCode).emit(GAME_EVENTS.GAME_UPDATED, lobby);
}

function finishPopQuiz(lobby, io) {
  if (!lobby.activeQuiz) return;
  if (lobby.gameStatus !== "popQuiz") return;

  if (lobby.gameTimer) {
    clearTimeout(lobby.gameTimer);
    lobby.gameTimer = null;
  }

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];
  if (lobby.activeQuiz.status === "correct") {
    currentPlayer.money += Number(lobby.edition.tiles[currentPlayer.position].money);
    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: "got ₩" + lobby.edition.tiles[currentPlayer.position].money + " for answering correctly.",
    });
  }
  else if (lobby.activeQuiz.status === "timerExpired" || lobby.activeQuiz.status === "incorrect") {
    currentPlayer.money -= Number(lobby.edition.tiles[currentPlayer.position].money);
    addLog(lobby.lobbyCode, {
      uid: currentPlayer.uid,
      username: currentPlayer.username,
      message: "paid ₩" + lobby.edition.tiles[currentPlayer.position].money + " for answering incorrectly.",
    });
  }

  lobby.activeQuiz = null;

  // incorrect quiz answers can push a player below zero
  // need to check here too
  if (setBankruptcyActionIfNeeded(lobby, currentPlayer)) {
    broadcastGameState(io, lobby);
    return;
  }

  startNextTurn(lobby, io, broadcastGameState);
}

function startQuizTimer(lobby, io) {
  if (lobby.gameTimer) {
    clearTimeout(lobby.gameTimer);
  }

  const timer = setTimeout(async () => {
    const currentLobby = getLobby(lobby.lobbyCode);
    if (currentLobby && currentLobby.gameStatus === "popQuiz" && currentLobby.activeQuiz) {
      currentLobby.activeQuiz.status = "timerExpired";
      broadcastGameState(io, currentLobby);

      await sleep(2500);
      finishPopQuiz(currentLobby, io);
    }
  }, 15000);

  // enumurable false prevents this field from being sent to the client
  Object.defineProperty(lobby, "gameTimer", {
    value: timer,
    enumerable: false,
    writable: true,
    configurable: true,
  });
}

export function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // server handler for quiz submission
    socket.on(
      GAME_EVENTS.QUIZ_SUBMIT_ANSWER, async ({ lobbyCode, uid, answer }) => {
        if (!lobbyCode || !uid || !answer) {
          emitGameError(socket, "Missing quiz answer data");
          return;
        }

        const lobby = getLobby(lobbyCode);

        if (!lobby) {
          emitGameError(socket, "Lobby not found.");
          return;
        }

        // prevent host from submitting their answer to the popup
        if (lobby.host.uid === uid) {
          emitGameError(socket, "Host cannot answer quiz questions.");

          return;
        }

        const player = lobby.players.find((player) => player.uid === uid);

        if (!player) {
          emitGameError(socket, "Only players can answer quiz questions.");

          return;
        }

        if (lobby.gameStatus !== "popQuiz" || !lobby.activeQuiz) {
          emitGameError(socket, "No active quiz.");
          return;
        }

        // check answer correctness
        if (answer === lobby.activeQuiz.correctAnswer) {
          lobby.activeQuiz.status = "correct";
        } else {
          lobby.activeQuiz.status = "incorrect";
        }

        // Clear active timer since an answer has been submitted
        if (lobby.gameTimer) {
          clearTimeout(lobby.gameTimer);
          lobby.gameTimer = null;
        }

        broadcastGameState(io, lobby);

        await sleep(2500);

        finishPopQuiz(lobby, io);
      },
    );

    socket.on(GAME_EVENTS.LOBBY_JOIN, ({ lobbyCode, player }) => {
      if (!lobbyCode || !player?.uid || !player?.username) {
        emitGameError(socket, "Missing lobby or player data");
        return;
      }

      const result = joinLobby(lobbyCode, {
        uid: player.uid,
        username: player.username,
        socketId: socket.id,
      });

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      socket.join(lobbyCode);
      broadcastGameState(io, result.lobby);
    });

    socket.on(GAME_EVENTS.PLAYER_UPDATE_TOKEN, ({ lobbyCode, uid, token }) => {
      if (!lobbyCode || !uid || !token) {
        emitGameError(socket, "Missing token update data");
        return;
      }

      const result = updatePlayerToken(lobbyCode, uid, token);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);
    });

    socket.on(
      GAME_EVENTS.GAME_START,
      ({ lobbyCode, hostUid, tiles, questions, startingPoints }) => {
        if (!lobbyCode || !hostUid) {
          emitGameError(socket, "Missing start game data");
          return;
        }

        const result = startGame(lobbyCode, hostUid, {
          tiles,
          questions,
          startingPoints,
        });

        if (result.error) {
          emitGameError(socket, result.error);
          return;
        }

        broadcastGameState(io, result.lobby);

        // make the startOfTurn overlay disappear after 2.5 seconds after the game starts
        setTimeout(() => {
          result.lobby.gameStatus = "idling";
          broadcastGameState(io, result.lobby);
        }, 2500);
      },
    );

    socket.on(GAME_EVENTS.GAME_ROLL_DICE, async ({ lobbyCode, uid }) => {
      if (!lobbyCode || !uid) {
        emitGameError(socket, "Missing roll dice data");
        return;
      }

      const result = rollDice(lobbyCode, uid);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);

      // before starting the next turn
      // check tile that player landed on
      // and do stuff
      // like run the pop quiz minigame, update points, etc

      await sleep(2000);

      // check tile that player landed on before advancing turn
      if (result.lobby.status === "finished") {
        return;
      }

      const landingResult = resolveLandingAction(result.lobby);

      if (landingResult.error) {
        emitGameError(socket, landingResult.error);
        return;
      }

      if (
        landingResult.lobby.gameStatus === "chance" ||
        landingResult.lobby.gameStatus === "community"
      ) {
        broadcastGameState(io, landingResult.lobby);
        await sleep(2500);

        const lobby = landingResult.lobby;
        const currentPlayer = lobby.players[lobby.currentPlayerIndex];

        applyCardEffect(lobby, currentPlayer, lobby.activeCard);

        broadcastGameState(io, lobby);
        await sleep(2500);
      }

      if (
        landingResult.lobby.gameStatus === "buyProperty" ||
        landingResult.lobby.gameStatus === "bankruptcy" ||
        landingResult.lobby.gameStatus === "jail"
      ) {
        broadcastGameState(io, landingResult.lobby);
        return;
      }

      if (landingResult.lobby.gameStatus === "popQuiz") {
        startQuizTimer(landingResult.lobby, io);

        broadcastGameState(io, landingResult.lobby);
        return;
      }

      if (landingResult.lobby.gameStatus === "miniGame") {
        broadcastGameState(io, landingResult.lobby);
        return;
      }

      landingResult.lobby.gameStatus = "turnEnded";
      broadcastGameState(io, landingResult.lobby);

      await sleep(1000);

      startNextTurn(landingResult.lobby, io, broadcastGameState);
    });

    // buy property handler
    socket.on(GAME_EVENTS.GAME_BUY_PROPERTY, ({ lobbyCode, uid }) => {
      if (!lobbyCode || !uid) {
        emitGameError(socket, "Missing buy property data");
        return;
      }

      const result = buyPendingProperty(lobbyCode, uid);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);
      startNextTurn(result.lobby, io, broadcastGameState);
    });

    // decline property handler
    socket.on(GAME_EVENTS.GAME_DECLINE_PROPERTY, ({ lobbyCode, uid }) => {
      if (!lobbyCode || !uid) {
        emitGameError(socket, "Missing decline property data");
        return;
      }

      const result = declinePendingProperty(lobbyCode, uid);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);

      // auction path stays paused in the auction overlay
      // but non-auction path should advance normally
      if (result.lobby.gameStatus === "turnEnded") {
        startNextTurn(result.lobby, io, broadcastGameState);
      }
    });

    // auction handler
    socket.on(GAME_EVENTS.GAME_PLACE_AUCTION_BID, ({ lobbyCode, uid, bidIncrement }) => {        
      const result = placeAuctionBid(lobbyCode, uid, bidIncrement);
      
      if (result.error) return emitGameError(socket, result.error);

      broadcastGameState(io, result.lobby);
    },  
  );

    socket.on(GAME_EVENTS.GAME_RESOLVE_AUCTION, ({ lobbyCode, hostUid }) => {
      const result = resolveAuction(lobbyCode, hostUid);
      if (result.error) return emitGameError(socket, result.error);

      broadcastGameState(io, result.lobby);

      if (
        result.lobby.gameStatus === "turnEnded" &&
        result.lobby.status !== "finished"
      ) {
        // Bankruptcy auctions can queue another auction, so only advance after the queue ends.
        startNextTurn(result.lobby, io, broadcastGameState);
      }
    });

    socket.on(GAME_EVENTS.GAME_START_BANKRUPTCY_AUCTION, ({ lobbyCode, hostUid, propertyId }) => {
      if (!lobbyCode || !hostUid || !propertyId) {
        emitGameError(socket, "Missing bankruptcy auction data");
        return;      
      }
      
      const result = startBankruptcyAuction(lobbyCode, hostUid, propertyId);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }
      broadcastGameState(io, result.lobby);   
    },
  );

    socket.on(GAME_EVENTS.GAME_CLEAR_BANKRUPTCY_PROPERTY, ({ lobbyCode, hostUid, propertyId }) => {
        if (!lobbyCode || !hostUid || !propertyId) {
          emitGameError(socket, "Missing bankruptcy property clear data");
          return;
        }

        const result = clearBankruptcyProperty(lobbyCode, hostUid, propertyId);

        if (result.error) {
          emitGameError(socket, result.error);
          return;
        }

        broadcastGameState(io, result.lobby);

        if (
          result.lobby.gameStatus === "turnEnded" &&
          result.lobby.status !== "finished"
        ) {
          startNextTurn(result.lobby, io, broadcastGameState);
        }
      },
    );

    socket.on(GAME_EVENTS.GAME_CLEAR_BANKRUPTCY_AUCTIONS, ({ lobbyCode, hostUid }) => {
      if (!lobbyCode || !hostUid) {
        emitGameError(socket, "Missing bankruptcy auction clear data");
        return;      
      }
      
      const result = clearBankruptcyAuctions(lobbyCode, hostUid);

      if (result.error) {
        emitGameError(socket, result.error);
        return;      
      }
      
      broadcastGameState(io, result.lobby);

      if (
        result.lobby.gameStatus === "turnEnded" &&
        result.lobby.status !== "finished"
      ) {
        startNextTurn(result.lobby, io, broadcastGameState);
      }
    },  
  );

    // sell property handler
    socket.on(GAME_EVENTS.GAME_SELL_PROPERTY, ({ lobbyCode, uid, propertyId }) => {
      if (!lobbyCode || !uid || !propertyId) {
        emitGameError(socket, "Missing sell property data");
        return;
      }

      const result = sellProperty(lobbyCode, uid, propertyId);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);

      if (
        result.lobby.gameStatus === "turnEnded" &&
        result.lobby.status !== "finished"
      ) {
        // A bankruptcy sale can recover the player and finish the blocked turn.
        startNextTurn(result.lobby, io, broadcastGameState);
      }
    });

    // jail
    socket.on(GAME_EVENTS.GAME_PAY_BAIL, ({ lobbyCode }) => {
      if (!lobbyCode) {
        emitGameError(socket, "Missing lobby data");
        return;
      }

      const lobby = lobbies[lobbyCode];
      const currentPlayer = lobby.players[lobby.currentPlayerIndex];

      currentPlayer.money -= 50;
      currentPlayer.jailed = false;

      addLog(lobbyCode, {
        uid: currentPlayer.uid,
        username: currentPlayer.username,
        message: "paid ₩50 to get out of jail.",
      });

      // bail can also push a player below zero if called server-side
      if (setBankruptcyActionIfNeeded(lobby, currentPlayer)) {
        broadcastGameState(io, lobby);
        return;
      }

      broadcastGameState(io, lobby);
      startNextTurn(lobby, io, broadcastGameState);
    });

    // generic pass turn handler (can be used for multiple cases)
    socket.on(GAME_EVENTS.GAME_PASS_TURN, ({ lobbyCode }) => {
      if (!lobbyCode) {
        emitGameError(socket, "Missing lobby data");
        return;
      }

      const lobby = lobbies[lobbyCode];
      const currentPlayer = lobby.players[lobby.currentPlayerIndex];

            
      if (lobby.gameStatus === "jail" && currentPlayer.jailed) {
        // passing from jail serves the jail turn and prevents an infinite jail loop
        currentPlayer.jailed = false;

        addLog(lobbyCode, {
          uid: currentPlayer.uid,
          username: currentPlayer.username,
          message: "served their jail turn and left jail.",
        });
      } else {
        addLog(lobbyCode, {
          uid: currentPlayer.uid,
          username: currentPlayer.username,
          message: "passed their turn.",
        });
      }

      startNextTurn(lobby, io, broadcastGameState);
    });

    // resolving bankruptcy handler
    socket.on(
      GAME_EVENTS.GAME_RESOLVE_BANKRUPTCY,
      ({ lobbyCode, hostUid, bankruptPlayerUid }) => {
        if (!lobbyCode || !hostUid || !bankruptPlayerUid) {
          emitGameError(socket, "Missing bankruptcy resolution data");
          return;
        }

        const result = resolveBankruptcy(lobbyCode, hostUid, bankruptPlayerUid);

        if (result.error) {
          emitGameError(socket, result.error);
          return;
        }

        broadcastGameState(io, result.lobby);

        if (
          result.lobby.gameStatus === "turnEnded" &&
          result.lobby.status !== "finished"
        ) {
          // Forced elimination may start auctions, so wait until bankruptcy is fully resolved.
          startNextTurn(result.lobby, io, broadcastGameState);
        }
      },
    );

    // declaring bankruptcy handler
    socket.on(GAME_EVENTS.GAME_DECLARE_BANKRUPTCY, ({ lobbyCode, uid }) => {
      if (!lobbyCode || !uid) {
        emitGameError(socket, "Missing bankruptcy declaration data");
        return;
      }

      // player chooses to declare bankruptcy
      const result = declareBankruptcy(lobbyCode, uid);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);

      if (
        result.lobby.gameStatus === "turnEnded" &&
        result.lobby.status !== "finished"
      ) {
        // Declared bankruptcy may start asset auctions before the next turn begins.
        startNextTurn(result.lobby, io, broadcastGameState);
      }
    });

    socket.on(GAME_EVENTS.GAME_HOST_SKIP_TURN, ({ lobbyCode }) => {
      const lobby = getLobby(lobbyCode);

      // avoid crash if lobby is undefined
      if (!lobby) {
        emitGameError(socket, "Lobby not found.");
        return;
      }

      if (lobby.host.socketId !== socket.id) {
        emitGameError(socket, "Only the host can skip turns.");
        return;
      }

      const result = forceSkipTurn(lobbyCode);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);
    });
    socket.on(GAME_EVENTS.LOBBY_LEAVE, ({ lobbyCode, uid }, callback) => {

      if (!lobbyCode || !uid) {
        emitGameError(socket, "Missing lobby leave data");
        return;
      }

      const result = leaveLobby(lobbyCode, uid);

      console.log("leaveLobby result", result.error);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      socket.leave(lobbyCode);

      broadcastGameState(io, result.lobby);

      if (typeof callback === "function") {
        callback();
      }
    });

    socket.on(GAME_EVENTS.LOBBY_HOST_LEAVE, ({ lobbyCode, uid }, callback) => {


      if (!lobbyCode || !uid) {
        emitGameError(socket, "Missing host leave data");
        return;
      }

      const lobby = getLobby(lobbyCode);

      if (!lobby) {
        emitGameError(socket, "Lobby not found");
        return;
      }

      // Verifying request came from the host.
      if (lobby.host.uid !== uid || lobby.host.socketId !== socket.id) {
        emitGameError(socket, "Only the host can close the lobby");
        return;
      }

      const result = closeLobby(lobbyCode, uid);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      // Notifying the host and all players are inside the room.
      socket.to(lobbyCode).emit(GAME_EVENTS.LOBBY_CLOSED, {
        message: "The host has closed the lobby.",
      });

      // Removeing every connected socket from the lobby room.
      io.in(lobbyCode).socketsLeave(lobbyCode);

      if (typeof callback === "function") {
        callback();
      }
    });

    socket.on(GAME_EVENTS.GAME_HOST_KICK_PLAYER, ({ lobbyCode, uid }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby || lobby.host.socketId !== socket.id) {
        emitGameError(socket, "Only the host can kick players.");
        return;
      }

      const result = kickPlayer(lobbyCode, uid);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      broadcastGameState(io, result.lobby);
    });

    socket.on(GAME_EVENTS.GAME_HOST_END_GAME, async ({ lobbyCode }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby) {
        emitGameError(socket, "Lobby not found");

        return;
      }

      if (lobby.host.socketId !== socket.id) {
        emitGameError(socket, "Only the host can end the game");

        return;
      }

      lobby.status = "finished";
      lobby.gameStatus = "turnEnded";
      lobby.activeQuiz = null;
      lobby.winnerUid = null;
      lobby.endTime = Date.now();

      addLog(lobbyCode, {
        uid: lobby.host.uid,
        username: lobby.host.username,
        message: "ended the game.",
      });

      // temporarily commented out
      // may submit incorrect scores (points-based instead of money-based)
      // await submitScoresToLeaderboard(lobby);

      broadcastGameState(io, lobby);
    });

    socket.on(GAME_EVENTS.GAME_HOST_RESTART_GAME, ({ lobbyCode }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby) {
        emitGameError(socket, "Restart failed. Lobby not found.");
        return;
      }

      if (lobby.host.socketId !== socket.id) {
        emitGameError(socket, "Only the host can restart the game.");
        return;
      }

      lobby.status = "playing";
      lobby.gameStatus = "startOfTurn";
      lobby.startTime = Date.now();
      lobby.endTime = null;
      lobby.currentPlayerIndex = 0;
      lobby.activeAuction = null;
      lobby.lastRoll = null;
      lobby.winnerUid = null;

      lobby.players.forEach((player) => {
        player.position = 0;
        player.points = lobby.edition.startingPoints ?? 0;
        player.money = lobby.edition.startingPoints ?? 1500;
        player.properties = [];
        player.isEliminated = false;
        player.isBankrupt = false;
      });

      addLog(lobbyCode, {
        uid: lobby.players[lobby.currentPlayerIndex].uid,
        username: lobby.players[lobby.currentPlayerIndex].username,
        message: "started their turn.",
      });

      broadcastGameState(io, lobby);

      setTimeout(() => {
        lobby.gameStatus = "idling";
        broadcastGameState(io, lobby);
      }, 2500);
    });

    // Update game edition handler
    socket.on(GAME_EVENTS.LOBBY_UPDATE_EDITION, ({ lobbyCode, editionName }) => {
      const { lobby } = updateLobbyEdition(lobbyCode, editionName);
  
      if (lobby) {
        broadcastGameState(io, lobby);
      }
    });

    socket.on("disconnect", () => {
      const result = disconnectPlayer(socket.id);

      if (result.lobby) {
        broadcastGameState(io, result.lobby);
      }

      console.log("Socket disconnected:", socket.id);
    });
  });
}
