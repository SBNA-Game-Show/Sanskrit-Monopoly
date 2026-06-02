import { useAuth } from "../context/AuthContext";
import type { GameState } from "../types/game/gameTypes";
import { GAME_EVENTS } from "../constants/socket/gameEvents";
import ZimMonopolyBoard from "../components/zim/ZimMonopolyBoard";
import { socket } from "../socket";
import { TOKEN_IMAGE_BY_ID } from "../constants/game/tokenOptions";

type GamePageProps = {
  gameState: GameState;
};

export default function GamePage({ gameState }: GamePageProps) {
  //for debugging (KEEP THIS)
  console.log(gameState);

  const { uid } = useAuth();

  const isHost = gameState.host.uid === uid;
  const currentPlayer = gameState.players.find(
    (player) => player.uid === gameState.currentTurnUid,
  );
  const handleRollDice = () => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_ROLL_DICE, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  return (
    <main className="min-h-[calc(100vh-56px)] bg-white font-jersey p-4">
      <section className="grid grid-cols-1 xl:grid-cols-[280px_1fr_320px] gap-4">
        <aside className="bg-[#FFC17E] rounded-3xl p-4 shadow">
          <h2 className="text-3xl text-white tracking-wider mb-4">Players</h2>

          <div className="space-y-3">
            {gameState.players.map((player) => (
              <div
                key={player.uid}
                className="bg-white rounded-2xl p-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-2xl text-[#FF8C00]">{player.username}</p>
                  <p className="text-sm text-gray-500">
                    Position {player.position} · {player.points} pts
                  </p>
                </div>

                {player.token && TOKEN_IMAGE_BY_ID[player.token] ? (
                  <img
                    src={TOKEN_IMAGE_BY_ID[player.token]}
                    alt={`${player.username} token`}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <span className="text-lg">No token</span>
                )}
              </div>
            ))}
          </div>
        </aside>

        <section className="bg-[#fff7ed] rounded-3xl p-4 shadow min-h-150">
          <ZimMonopolyBoard
            players={gameState.players}
            currentTurnUid={gameState.currentTurnUid}
          />
        </section>

        <aside className="bg-[#FFC17E] rounded-3xl p-4 shadow">
          <h2 className="text-3xl text-white tracking-wider mb-4">Game</h2>

          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="text-xl text-[#FF8C00]">Current Turn</p>
            <p className="text-2xl">
              {currentPlayer?.username ?? "Waiting..."}
            </p>
            <p className="text-2xl">
              Last roll: {gameState.lastRoll ?? "None"}
            </p>
          </div>

          {isHost ? (
            <div className="space-y-3">
              <button className="w-full bg-[#FF8C00] text-white rounded-2xl p-3 text-2xl transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
                Host Control
              </button>
              <button className="w-full bg-[#FF8C00] text-white rounded-2xl p-3 text-2xl transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
                End Game
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleRollDice}
                disabled={gameState.currentTurnUid !== uid}
                className="w-full bg-[#FF8C00] text-white rounded-2xl p-3 text-2xl transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Roll Dice
              </button>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
