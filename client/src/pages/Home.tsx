import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket";

function Home() {
  return (
    <main className="home-page">
      <section className="hero-card">
        <p className="eyebrow">THE Sanskrit Monopoly</p>

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

        <div className="socket-test">
          <p>{serverMessage}</p>
          <button type="button" onClick={testSocket}>
            Test that dang socket
          </button>
        </div>

        <Link to="/rules" className="nav-link">
          Them Rules
        </Link>
      </section>
    </main>
  );
}

export default Home;
