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

function emitGameError(socket, message) {
  socket.emit(GAME_EVENTS.GAME_ERROR, { message });
}

function broadcastGameState(io, lobby) {
  io.to(lobby.lobbyCode).emit(GAME_EVENTS.GAME_UPDATED, lobby);
}

export function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

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
