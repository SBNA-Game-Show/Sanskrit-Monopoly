import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Home() {
  const [lobbyCode, setLobbyCode] = useState("");
  const navigate = useNavigate();
  const { uid, username } = useAuth();

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
    <main className="home-page">
      <section className="hero-card">
        <p className="text-red-800">THE Sanskrit Monopoly</p>

        <h1>Test your Sanskrit knowledge!</h1>

        <p className="hero-copy">
          Monopoly-styled board game with cultural heritage sites as rewards or
          whatever
        </p>
        <div className="action-row">
          <button onClick={createRoom} type="button">
            Create Room
          </button>

          <div className="join-box">
            <input
              type="text"
              placeholder="Enter room code"
              aria-label="Room code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
            />
            <button type="button" onClick={() => navigate(`/lobby/${lobbyCode}`)}>Join Room</button>
          </div>
        </div>

        <Link to="/rules" className="nav-link">
          The Rules
        </Link>
      </section>
    </main>
  );
}

export default Home;