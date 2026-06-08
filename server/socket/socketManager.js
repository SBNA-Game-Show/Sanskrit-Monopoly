import {
  getLobby,
  joinLobby,
  updatePlayerToken,
  startGame,
  rollDice,
  forceSkipTurn,
  kickPlayer,
  disconnectPlayer,
  startNextTurn,
} from "../services/gameService.js";

import { GAME_EVENTS } from "../../shared/gameEvents.js";

const POP_QUIZ_DURATION_MS = 30000;

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
      ({ lobbyCode, hostUid, edition, startingPoints }) => {
        if (!lobbyCode || !hostUid) {
          emitGameError(socket, "Missing start game data");
          return;
        }

        const result = startGame(lobbyCode, hostUid, {
          edition,
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

    socket.on(GAME_EVENTS.GAME_ROLL_DICE, ({ lobbyCode, uid }) => {
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
      //always run this LAST at the end of a turn
      broadcastGameState(io, result.lobby);

      // close quiz after pop quiz timer haas passed
      if (result.lobby.gameStatus === "popQuiz") {
        setTimeout(() => {
          finishPopQuiz(result.lobby, io);
        }, POP_QUIZ_DURATION_MS);

        return;
      }

      startNextTurn(result.lobby, io, broadcastGameState);
    });

    socket.on(GAME_EVENTS.GAME_HOST_SKIP_TURN, ({ lobbyCode }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobbyCode) {
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

    socket.on(GAME_EVENTS.GAME_HOST_END_GAME, ({ lobbyCode }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby || lobby.host.socketId !== socket.id) {
        emitGameError(socket, "Only the host can end the game.");
        return;
      }

      lobby.status = "finished";
      broadcastGameState(io, lobby);
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
