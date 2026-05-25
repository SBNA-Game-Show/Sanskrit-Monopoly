import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { uid, username, } = useAuth();

  const createRoom = async () => {
    const response = await fetch("http://localhost:3000/api/lobby-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostUid: uid, hostUsername: username }),
    });

    const data = await response.json();
    navigate(`/lobby/${data.lobby.lobbyCode}`);
  };

  return (
    <main className="grid min-h-[calc(100vh-56px)] place-items-center bg-orange-50 p-8">
      <section className="flex w-full max-w-4xl flex-col items-center rounded-3xl bg-white p-12 text-center shadow-xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-700">
          THE Sanskrit Monopoly
        </p>

        <h1 className="m-0 max-w-2xl text-2xl font-extrabold leading-tight text-slate-800 sm:text-2xl">
          Test your Sanskrit knowledge!
        </h1>

        <p className="mx-auto my-6 max-w-2xl text-lg text-slate-600">
          Monopoly-styled board game with cultural heritage sites as rewards or
          whatever
        </p>
        <div className="mb-5 flex flex-wrap items-center justify-center gap-4">
          <button onClick={createRoom}
            type="button"
            className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white transition hover:bg-orange-200 hover:text-slate-900"
          >
            
            Create Room
          
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            <input
              type="text"
              placeholder="Enter room code"
              aria-label="Room code"
              className="min-w-45 rounded-full border border-orange-200 px-4 py-3 outline-none transition focus:border-orange-500"
            />

            <button
              type="button"
              className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white transition hover:bg-orange-200 hover:text-slate-900"
            >
              Join Room
            </button>
          </div>
        </div>

        <Link
          to="/rules"
          className="font-bold text-blue-700 no-underline transition hover:text-orange-500"
        >
          Them Rules
        </Link>
      </section>
    </main>
  );
}

export default Home;