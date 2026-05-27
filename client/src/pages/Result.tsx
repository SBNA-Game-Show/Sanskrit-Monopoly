import { useNavigate } from "react-router-dom";
import { LOBBY_STATE } from "../content/fakeGameData";

function Result() {
    const navigate = useNavigate();

    const sortedPlayers = [...LOBBY_STATE.players].sort(
        (a, b) => b.points - a.points
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
                        <p>🏆 Winner: {winner.username}</p>
                    </div>

                    <div>
                        <p>Room: {LOBBY_STATE.lobbyCode}</p>
                    </div>
                </header>

                <main className="result-main">
                    <h1 className="leaderboard-title">⭐ LEADERBOARD ⭐</h1>

                    <div className="result-grid">
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={player.uid}
                                className={`result-player-card ${index === 0 ? "winner-card" : ""
                                    }`}
                            >
                                <div className="rank-badge">#{index + 1}</div>

                                <img
                                    src={player.token}
                                    alt={`${player.username} token`}
                                    className="player-token"
                                />

                                <div className="player-result-info">
                                    <h2>{player.username}</h2>

                                    <div className="result-stats">
                                        <span>⭐ {player.points}</span>
                                        <span>💰 {player.money}</span>
                                        <span>🏠 {player.properties.length}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="result-buttons">
                        <button onClick={() => navigate("/game")}>Restart Game</button>
                        <button onClick={() => navigate("/lobby/4C1OR4")}>
                            Return To Lobby
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Result;