import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

function Lobby() {
  const [lobbyState, setLobbyState] = useState(null);
  const { lobbyCode } = useParams();
  const { uid, username, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    socket.emit("lobby-join", { lobbyCode, uid, username });

    socket.on("lobby-update", (lobby) => {
      setLobbyState(lobby);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [authLoading]);

  return (
    <>
      <div>Lobby Code: {lobbyCode}</div>
    </>
  );
}

export default Lobby;