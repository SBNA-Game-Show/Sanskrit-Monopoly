import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

function Lobby() {
  const { lobbyCode } = useParams();

  useEffect(() => {
    socket.on("error", ({ message }) => alert(message));

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  return (
    <main className="min-h-[calc(100vh-56px)] bg-orange-50 px-6 py-10">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="m-0 text-3xl font-extrabold text-slate-800">Lobby</h1>

        <p className="mt-2 text-slate-600">Sample Text babyyyyy</p>
      </section>
      <div>Lobby Code: {lobbyCode}</div>
    </main>
  );
}

export default Lobby;
