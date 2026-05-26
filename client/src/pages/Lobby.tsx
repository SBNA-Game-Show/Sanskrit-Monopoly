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
    <main className="min-h-[calc(100vh-56px)] bg-orange-50 px-6 py-10">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="m-0 text-3xl font-extrabold text-slate-800">Lobby</h1>

        <p className="mt-2 text-slate-600">Lobby Code: {lobbyCode}</p>
      </section>
    </main>
  );
}

export default Lobby;
