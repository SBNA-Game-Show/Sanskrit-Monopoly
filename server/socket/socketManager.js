import { lobbies } from "../services/gameService.js";

export function setupSocketEvents(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("lobby-join", ({ lobbyCode, uid, username }) => {
      const lobby = lobbies[lobbyCode];
      if (lobby && lobby.status === "waiting") {
        if (lobby.host.uid === uid) {
          lobby.host.socketId = socket.id;
        } 
        else {
          const existingPlayer = lobby.players.find((p) => p.uid === uid);
          if (existingPlayer) {
            existingPlayer.socketId = socket.id;
          } else {
            lobby.players.push({ uid, username, socketId: socket.id });
          }
        }
        socket.join(lobbyCode);
        io.to(lobbyCode).emit("lobby-update", lobby);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
