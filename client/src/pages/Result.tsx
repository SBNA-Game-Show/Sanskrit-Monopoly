import { socket } from "../socket";
import { GAME_EVENTS } from "../constants/socket/gameEvents";
import { useNav } from "../components/TransitionOverlay";
import "../styles/results.css";
import { TOKEN_IMAGE_BY_ID } from "../constants/game/tokenOptions";

function Result({ gameState }: any) {
  const navigate = useNav();

  const sortedPlayers = [...gameState.players].sort(
    (a, b) => (b.money || 0) - (a.money || 0),
  );

  const winner = sortedPlayers[0];

  return (
    <div className="result-page">
      <div className="result-frame">
        <header className="result-header">
          <div>
            <h2>Sanskrit Monopoly</h2>
            <p>संस्कृत-निकषः</p>
          </div>

          <div className="result-header-center">
            <h2>RESULTS</h2>
            <p>
              <span className="winner-trophy">🏆</span>
              Winner: {winner.username}
            </p>
          </div>

          <div className="result-room">Room: {gameState.lobbyCode}</div>
        </header>

        <main className="result-main">
          <h1 className="leaderboard-title">LEADERBOARD</h1>

          <p className="result-subtitle">
            Great job, players! उत्तमम् कार्यम्!
          </p>

          <div className="result-grid">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.uid}
                className={`result-player-card ${index === 0 ? "winner-card" : ""
                  }`}
              >
                {index === 0 && <div className="winner-ribbon">WINNER</div>}
                {index === 0 && <div className="winner-crown">👑</div>}
                <div className="rank-badge">#{index + 1}</div>

                <div className="token-box">
                  <img
                    src={TOKEN_IMAGE_BY_ID[player.token] || "/vite.svg"}
                    alt={`${player.username} token`}
                    className="player-token"
                  />
                </div>

                <div className="player-result-info">
                  <h2>{player.username}</h2>

                  <div className="result-stats">
                    <div className="stat-box">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-label">Points/अंकाः</span>
                      <strong>{player.money || 0}</strong>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="result-buttons">
            <button
              className="restart-btn"
              onClick={() =>
                socket.emit(GAME_EVENTS.GAME_HOST_RESTART_GAME, {
                  lobbyCode: gameState.lobbyCode,
                })
              }
            >
              🎲 Restart Game
              <span className="button-sanskrit">पुनः क्रीडा</span>
            </button>

            <button className="lobby-btn" onClick={() => navigate("/home")}>
              🏛 Back to Main Lobby
              <span className="button-sanskrit">मुख्य-सभागृहं</span>
            </button>
          </div>
          <p className="result-quote">“विद्या धनं सर्वधनप्रधानम्”</p>

          <p className="result-quote-english">
            Knowledge is the greatest wealth.
          </p>
        </main>
      </div>
    </div>
  );
}

export default Result;


