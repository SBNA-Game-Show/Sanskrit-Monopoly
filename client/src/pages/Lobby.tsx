import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import AdminGame from "./AdminGame";
import Game from "./Game";

function Lobby() {
  const [lobbyState, setLobbyState] = useState(null);
  const { lobbyCode } = useParams();
  const { uid, username, authLoading } = useAuth();

  console.log(lobbyState)

  useEffect(() => {
    if (authLoading) return;
    console.log("MOUNTING");
    socket.emit("lobby-join", { lobbyCode, uid, username });

    socket.on("lobby-update", (lobby) => {
      setLobbyState(lobby);
    });

    socket.on("error", (err) => console.log(err));

    return () => {
      socket.removeAllListeners();
    };
  }, [authLoading]);

  const host = lobbyState?.host;
  const players = lobbyState?.players || [];

  if (lobbyState && lobbyState.status === "waiting") {
    return (
      <main className="min-h-[calc(100vh-56px)] bg-orange-50 px-6 py-10">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="m-0 mb-6 text-3xl font-extrabold text-slate-800">Lobby Code: {lobbyCode}</h1>
          
          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-700 mb-3">Players ({lobbyState ? players.length : 0})</h2>
            <div className="space-y-2">
              {host && (
                <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4 border border-orange-100">
                  <span className="font-bold text-slate-800">{`${host.username} | socket id: ${host.socketId}`}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Host</span>
                </div>
              )}
              {players.map((player: any, idx: number) => (
                <div key={player.uid || idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="font-medium text-slate-700">{`${player.username} | socket id: ${player.socketId}`}</span>
                  <span className="text-xs font-semibold text-slate-500">Player</span>
                </div>
              ))}
            </div>
          </div>

          {host.socketId === socket.id && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => socket.emit("game-start", { lobbyCode })}
                className="w-full sm:w-auto rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg px-10 py-4 shadow-lg shadow-orange-600/20 transition hover:shadow-orange-600/30 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                disabled={players.length < 4}
              >
                Start Game
              </button>
            </div>
          )}

        </section>
      </main>
    );
  } 

  if (lobbyState && lobbyState.status === "playing" && host.socketId === socket.id) {
    return <AdminGame gameState={lobbyState}/>
  }

  if (lobbyState && lobbyState.status === "playing" && host.socketId !== socket.id) {
    return <Game gameState={lobbyState}/>
  }
}

export default Lobby;
