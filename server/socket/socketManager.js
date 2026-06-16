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
  disconnectPlayer,
  startNextTurn,
  resolveLandingAction,
  resolveBankruptcy,
  buyPendingProperty,
  declinePendingProperty,
} from "../services/gameService.js";

import { GAME_EVENTS } from "../../shared/gameEvents.js";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function emitGameError(socket, message) {
  socket.emit(GAME_EVENTS.GAME_ERROR, { message });
}

function broadcastGameState(io, lobby) {
  io.to(lobby.lobbyCode).emit(GAME_EVENTS.GAME_UPDATED, lobby);
}

// pop-quiz helper
function finishPopQuiz(lobby, io) {
  if (!lobby.activeQuiz) return;
  if (lobby.gameStatus !== "popQuiz") return;

  lobby.activeQuiz.status = "closed";
  lobby.activeQuiz = null;
  lobby.gameStatus = "turnEnded";

  broadcastGameState(io, lobby);

  startNextTurn(lobby, io, broadcastGameState);
}

export function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // server handler for quiz submission
    socket.on(
      GAME_EVENTS.QUIZ_SUBMIT_ANSWER,
      ({ lobbyCode, uid, optionId }) => {
        if (!lobbyCode || !uid || !optionId) {
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

        lobby.activeQuiz.answers[uid] = optionId;

        const answeredCount = Object.keys(lobby.activeQuiz.answers).length;
        const playerCount = lobby.players.length;

        if (answeredCount >= playerCount) {
          finishPopQuiz(lobby, io);
          return;
        }

        broadcastGameState(io, lobby);
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
      ({ lobbyCode, hostUid, tiles, startingPoints }) => {
        if (!lobbyCode || !hostUid) {
          emitGameError(socket, "Missing start game data");
          return;
        }

        const result = startGame(lobbyCode, hostUid, {
          tiles,
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

      if (landingResult.lobby.pendingAction) {
        broadcastGameState(io, landingResult.lobby);
        return;
      }

      if (landingResult.lobby.gameStatus === "popQuiz") {
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
      startNextTurn(result.lobby, io, broadcastGameState);
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

        if (result.lobby.status !== "finished") {
          startNextTurn(result.lobby, io, broadcastGameState);
        }
      },
    );

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
      lobby.pendingAction = null;
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
      lobby.lastRoll = null;
      lobby.winnerUid = null;

      lobby.pendingAction = null;

      lobby.players.forEach((player) => {
        player.position = 0;
        player.points = lobby.edition.startingPoints ?? 0;
        player.money = lobby.edition.startingPoints ?? 1500;
        player.properties = [];
        player.isEliminated = false;
        player.needsBankruptcyResolution = false;
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

    socket.on("disconnect", () => {
      const result = disconnectPlayer(socket.id);

      if (result.lobby) {
        broadcastGameState(io, result.lobby);
      }

      console.log("Socket disconnected:", socket.id);
    });
  });
}
