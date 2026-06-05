import { submitScoresToLeaderboard } from "../services/leaderboardService.js";
import { lobbies } from "../services/gameService.js";

export function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("lobby-join", ({ lobbyCode, uid, username }) => {
      const lobby = lobbies[lobbyCode];

      if (!lobby) {
        console.log("Lobby not found:", lobbyCode);
        return;
      }

      if (lobby.host.uid === uid) {
        lobby.host.socketId = socket.id;
      } else {
        const existingPlayer = lobby.players.find((p) => p.uid === uid);

        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
        } else {
          lobby.players.push({
            uid,
            username,
            socketId: socket.id,
            points: 0,
          });
        }
      }

      socket.join(lobbyCode);
      io.to(lobbyCode).emit("lobby-update", lobby);
    });

    socket.on("game-start", ({ lobbyCode }) => {
      const lobby = lobbies[lobbyCode];

      if (!lobby) {
        console.log("Game start failed. Lobby not found:", lobbyCode);
        return;
      }

      if (lobby.host.socketId !== socket.id) {
        console.log("Game start failed. Only host can start game.");
        return;
      }

      lobby.status = "playing";
      lobby.startTime = Date.now();

      console.log("Game started:", {
        lobbyCode,
        startTime: lobby.startTime,
      });

      io.to(lobbyCode).emit("lobby-update", lobby);
    });

    socket.on("end-game", async ({ lobbyCode, players }) => {

      const lobby = lobbies[lobbyCode];

      if (!lobby) {
        console.log("End game failed. Lobby not found:", lobbyCode);
        return;
      }

      if (lobby.host.socketId !== socket.id) {
        console.log("End game failed. Only host can end game.");
        return;
      }

      try {
        if (Array.isArray(players)) {
          lobby.players = players;
        }

        lobby.endTime = Date.now();

        console.log("Submitting scores to leaderboard...");

        await submitScoresToLeaderboard(lobby);

        lobby.status = "finished";

        console.log("Game finished:", {
          lobbyCode,
          startTime: lobby.startTime,
          endTime: lobby.endTime,
          players: lobby.players.length,
        });

        io.to(lobbyCode).emit("lobby-update", lobby);
      } catch (error) {
        console.error("Failed to end game:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}