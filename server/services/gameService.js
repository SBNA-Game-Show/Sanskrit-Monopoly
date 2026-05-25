export let lobbies = {};

export function generateLobbyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function createLobby(hostUid, hostUsername) {
  const lobbyCode = generateLobbyCode();
  lobbies[lobbyCode] = {
    lobbyCode: lobbyCode,
    status: "waiting",
    players: [],
    hostUid: hostUid,
    hostUsername: hostUsername
  }
  console.log(lobbies);
  return lobbies[lobbyCode]
}