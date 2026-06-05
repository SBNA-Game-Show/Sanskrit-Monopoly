import "dotenv/config";
import { setupServer } from "./serverConfig.js";
import { setupSocketEvents } from "./socket/socketManager.js";
import { createLobby } from "./services/gameService.js";

const { app, server, io } = setupServer();

setupSocketEvents(io);

app.post("/api/lobby-create", async (req, res) => {
  console.log("POST /api/lobby-create called", req.body);
  try {
    const { hostUid, hostUsername } = req.body;
    const lobby = createLobby(hostUid, hostUsername);
    res.json({ lobby });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to create game",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
