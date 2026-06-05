export let lobbies = {};

export function generateLobbyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function createLobby(hostUid, hostUsername) {
  const lobbyCode = generateLobbyCode();

  const lobby = {
    lobbyCode,
    status: "waiting",
    players: [],
    host: {
      uid: hostUid,
      username: hostUsername,
      socketId: null,
    },
  };

  lobbies[lobbyCode] = lobby;

  console.log("========== LOBBY CREATED ==========");
  console.log("Lobby Code:", lobbyCode);
  console.log("Current Lobbies:", Object.keys(lobbies));

  return lobby;
}