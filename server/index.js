import "dotenv/config";
import { setupServer } from "./serverConfig.js";
import { setupSocketEvents } from "./socket/socketManager.js";
import { createLobby, lobbies } from "./services/gameService.js";

const { app, server, io } = setupServer();

setupSocketEvents(io);

app.post("/api/lobby-create", async (req, res) => {
  try {
    const { hostUid, hostUsername, isPrivate } = req.body;
    const lobby = createLobby(hostUid, hostUsername, isPrivate);
    res.json({ lobby });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create game",
      details: error.message,
    });
  }
});

app.get("/api/lobbies", (req, res) => {
  try {
    const allLobbies = Object.values(lobbies || {})
    .filter((lobby) => !lobby.isPrivate) // Only show public lobbies
    .map((lobby) => ({
      code: lobby.lobbyCode,
      host: lobby.host?.username || "Unknown Host",
      players: lobby.players?.length || 1,
      maxPlayers: 4,
      edition: lobby.edition?.name || "Standard Edition"
    }));

    res.status(200).json({ lobbies: allLobbies });
  } catch (error) {
    console.error("Error fetching lobbies:", error);
    res.status(500).json({ error: "Failed to fetch active lobbies" });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
