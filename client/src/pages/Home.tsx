import { Link } from "react-router-dom";

function Home() {
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
          <button type="button">Create Room</button>

          <div className="join-box">
            <input
              type="text"
              placeholder="Enter room code"
              aria-label="Room code"
            />
            <button type="button">Join Room</button>
          </div>
        </div>

        <Link to="/rules" className="nav-link">
          Them Rules
        </Link>
      </section>
    </main>
  );
}

export default Home;
