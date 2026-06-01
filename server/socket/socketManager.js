import {
  disconnectPlayer,
  joinLobby,
  startGame,
  rollDice,
  updateHostSocket,
  updatePlayerToken,
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

    socket.on(GAME_EVENTS.HOST_JOIN, ({ lobbyCode }) => {
      const result = updateHostSocket(lobbyCode, socket.id);

      if (result.error) {
        emitGameError(socket, result.error);
        return;
      }

      socket.join(lobbyCode);
      broadcastGameState(io, result.lobby);
    });

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
