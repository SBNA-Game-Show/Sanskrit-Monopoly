import {
  adjustPlayerScore,
  getLobby,
  handlePlayerAction,
  lobbies,
  nextTurn,
  removeGamePlayer,
  rollDice,
  startGame,
} from "../services/gameService.js";

function emitError(socket, message) {
  socket.emit("error-message", message);
}

function emitLobby(io, lobbyCode, lobby) {
  io.to(lobbyCode).emit("lobby-update", lobby);
}

export function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("lobby-join", ({ lobbyCode, uid, username }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby) {
        emitError(socket, "Lobby not found.");
        return;
      }

      if (lobby.host.uid === uid) {
        lobby.host.socketId = socket.id;
      } else {
        const existingPlayer = lobby.players.find((player) => player.uid === uid);

        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
          existingPlayer.username = username || existingPlayer.username;
        } else {
          if (lobby.players.length >= 4) {
            emitError(socket, "This lobby is full. Maximum 4 players allowed.");
            return;
          }

          lobby.players.push({
            uid,
            username: username || `Player ${lobby.players.length + 1}`,
            socketId: socket.id,
          });
        }
      }

      socket.join(lobbyCode);
      emitLobby(io, lobbyCode, lobby);
    });

    socket.on("game-start", ({ lobbyCode, selectedEdition, startingMoney, playerTokens }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby) {
        emitError(socket, "Lobby not found.");
        return;
      }

      if (lobby.host.socketId !== socket.id) {
        emitError(socket, "Only the host can start the game.");
        return;
      }

      const result = startGame(lobbyCode, selectedEdition, startingMoney, playerTokens);

      if (result.error) {
        emitError(socket, result.error);
        return;
      }

      emitLobby(io, lobbyCode, result.lobby);
    });

    socket.on("game-roll-dice", ({ lobbyCode }) => {
      const result = rollDice(lobbyCode, socket.id);

      if (result.error) {
        emitError(socket, result.error);
        return;
      }

      emitLobby(io, lobbyCode, result.lobby);
    });

    socket.on("game-admin-force-roll", ({ lobbyCode }) => {
      const result = rollDice(lobbyCode, socket.id, { force: true });

      if (result.error) {
        emitError(socket, result.error);
        return;
      }

      emitLobby(io, lobbyCode, result.lobby);
    });

    socket.on("game-admin-next-turn", ({ lobbyCode }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby) {
        emitError(socket, "Lobby not found.");
        return;
      }

      if (lobby.host.socketId !== socket.id) {
        emitError(socket, "Only the host can skip turns.");
        return;
      }

      const result = nextTurn(lobbyCode);

      if (result.error) {
        emitError(socket, result.error);
        return;
      }

      emitLobby(io, lobbyCode, result.lobby);
    });

    socket.on("game-admin-adjust-score", ({ lobbyCode, playerId, amount }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby || lobby.host.socketId !== socket.id) {
        emitError(socket, "Only the host can adjust score.");
        return;
      }

      const result = adjustPlayerScore(lobbyCode, playerId, amount);

      if (result.error) {
        emitError(socket, result.error);
        return;
      }

      emitLobby(io, lobbyCode, result.lobby);
    });

    socket.on("game-admin-remove-player", ({ lobbyCode, playerId }) => {
      const lobby = getLobby(lobbyCode);

      if (!lobby || lobby.host.socketId !== socket.id) {
        emitError(socket, "Only the host can remove players.");
        return;
      }

      const result = removeGamePlayer(lobbyCode, playerId);

      if (result.error) {
        emitError(socket, result.error);
        return;
      }

      emitLobby(io, lobbyCode, result.lobby);
    });

    socket.on("game-player-action", ({ lobbyCode, action }) => {
      const result = handlePlayerAction(lobbyCode, socket.id, action);

      if (result.error) {
        emitError(socket, result.error);
        return;
      }

      emitLobby(io, lobbyCode, result.lobby);
    });

    socket.on("disconnect", () => {
      Object.values(lobbies).forEach((lobby) => {
        if (lobby.host.socketId === socket.id) {
          lobby.host.socketId = null;
        }

        lobby.players.forEach((player) => {
          if (player.socketId === socket.id) {
            player.socketId = null;
          }
        });
      });

      console.log("Socket disconnected:", socket.id);
    });
  });
}
