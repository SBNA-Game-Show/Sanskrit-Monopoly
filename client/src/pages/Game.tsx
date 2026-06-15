import { useAuth } from "../context/AuthContext";
import type { GameState } from "../types/game/gameTypes";
import { GAME_EVENTS } from "../constants/socket/gameEvents";
import { ZimMonopolyBoard } from "../components/zim/ZimMonopolyBoard";
import { socket } from "../socket";
import { TOKEN_IMAGE_BY_ID } from "../constants/game/tokenOptions";
import { GameOverlayLayer } from "../components/game/GameOverlayLayer";

type GameProps = {
  gameState: GameState;
};

// mini-function that changes how the money is formatted
// previously, when money went below 0, it would render ₩-106
// this just makes it look -₩106 so it's more visually correct
function formatMoney(amount: number) {
  return amount < 0 ? `-₩${Math.abs(amount)}` : `₩${amount}`;
}

export default function Game({ gameState }: GameProps) {
  //for debugging (KEEP THIS)
  console.log(gameState);

  const { uid } = useAuth();

  const isHost = gameState.host.uid === uid;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleSubmitQuizAnswer = (optionId: string) => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.QUIZ_SUBMIT_ANSWER, {
      lobbyCode: gameState.lobbyCode,
      uid,
      optionId,
    });
  };

  const handleRollDice = () => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_ROLL_DICE, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  // handler for buying properties
  const handleBuyProperty = () => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_BUY_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  // handler for declining properties
  const handleDeclineProperty = () => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_DECLINE_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  // handler for resolving bankruptcy
  const handleResolveBankruptcy = (bankruptPlayerUid: string) => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_RESOLVE_BANKRUPTCY, {
      lobbyCode: gameState.lobbyCode,
      hostUid: uid,
      bankruptPlayerUid,
    });
  };

  const handleSkipTurn = () => {
    if (!gameState.lobbyCode || !uid) return;
    socket.emit(GAME_EVENTS.GAME_HOST_SKIP_TURN, {
      lobbyCode: gameState.lobbyCode,
    });
  };

  const handleKickPlayer = (uid: string) => {
    if (!gameState.lobbyCode || !uid) return;
    socket.emit(GAME_EVENTS.GAME_HOST_KICK_PLAYER, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  const handleEndGame = () => {
    if (!gameState.lobbyCode || !uid) return;
    socket.emit(GAME_EVENTS.GAME_HOST_END_GAME, {
      lobbyCode: gameState.lobbyCode,
    });
  };

  return (
    <main className="min-h-screen w-full bg-[#fffaf0] font-sans text-[#160f08]">
      <section className="grid min-h-screen grid-cols-1 xl:grid-cols-[340px_1fr_340px] gap-6 p-6">
        {/* Left: Players */}
        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-5 shadow-xl">
          <h2 className="mb-5 text-[28px] font-bold leading-none text-[#ff514b]">
            Players
          </h2>
          {gameState.lastAction && (
            <div className="mb-5 rounded-2xl border-2 border-[#d9a441] bg-[#fff4dc] px-5 py-3 text-sm font-extrabold text-[#6b3f1d] shadow-md">
              {gameState.lastAction.message}
            </div>
          )}

          <div className="space-y-5">
            {gameState.players.map((player, index) => {
              const isCurrentTurn = player.uid === currentPlayer?.uid;

              return (
                <div
                  key={player.uid}
                  className={`rounded-2xl border-[6px] p-4 shadow-md ${
                    player.isEliminated
                      ? "border-[#7a5c42] bg-[#b89775] opacity-60 grayscale"
                      : isCurrentTurn
                        ? "border-[#6b3f1d] bg-[#ffd7a3]"
                        : "border-[#ffa23b] bg-[#ffb45c]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[15px] leading-[1.45]">
                      <p className="font-semibold">
                        Player {index + 1} — {player.username}
                      </p>
                      <p>Position: {player.position}</p>
                      {/* Modified to use 'Money' for now. Will create edition-related logic later */}
                      <p>Money: {formatMoney(player.money ?? 0)}</p>
                      <p>Properties: {player.properties.length}</p>
                      {player.needsBankruptcyResolution &&
                        !player.isEliminated && (
                          <p className="mt-1 text-xs font-extrabold text-red-700">
                            Bankruptcy pending
                          </p>
                        )}
                      {player.isEliminated && (
                        <p className="mt-1 text-xs font-extrabold text-red-800">
                          Eliminated
                        </p>
                      )}
                      {/* TESTING PURPOSES: Show owned tile names per player */}
                      Tile names:{" "}
                      {player.properties.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs font-semibold text-[#6b3f1d]">
                          {player.properties.map((tileId) => {
                            const tile = gameState.edition.tiles.find(
                              (currentTile) => currentTile.id === tileId,
                            );

                            return <li key={tileId}>{tile?.name ?? tileId}</li>;
                          })}
                        </ul>
                      )}
                    </div>

                    {player.token && TOKEN_IMAGE_BY_ID[player.token] ? (
                      <img
                        src={TOKEN_IMAGE_BY_ID[player.token]}
                        alt={`${player.username} token`}
                        className="h-[64px] w-[64px] object-contain rounded-xl bg-white/25"
                      />
                    ) : (
                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-xl bg-white/25 text-sm text-[#6b3f1d]">
                        No token
                      </div>
                    )}
                  </div>

                  {isHost &&
                    gameState.status !== "finished" &&
                    player.uid !== uid &&
                    !player.isEliminated && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleKickPlayer(player.uid)}
                          className="rounded-full bg-[#b33a3a] px-4 py-2 text-xs font-bold text-white shadow"
                        >
                          Kick
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col">
          <div className="flex flex-1 items-center justify-center rounded-[22px] border-[12px] border-[#6b3f1d] bg-[#202733] p-4 shadow-2xl">
            <div className="aspect-square h-full max-h-[calc(100vh-190px)] w-full max-w-[calc(100vh-190px)]">
              <ZimMonopolyBoard
                players={gameState.players}
                currentTurnUid={currentPlayer?.uid ?? null}
                lastRoll={gameState.lastRoll}
              />
            </div>

            <GameOverlayLayer
              gameState={gameState}
              isHost={gameState.host.uid === uid}
              onSubmitQuizAnswer={handleSubmitQuizAnswer}
              onBuyProperty={handleBuyProperty}
              onDeclineProperty={handleDeclineProperty}
              onResolveBankruptcy={handleResolveBankruptcy}
            />
          </div>
        </section>

        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-6 shadow-xl">
          <div className="mb-6 rounded-2xl bg-[#fff4dc] p-4 text-[18px] leading-tight shadow-inner">
            <p className="mb-2 font-bold text-[#6b3f1d]">Current Turn</p>
            <p className="text-[22px] font-semibold text-[#160f08]">
              {currentPlayer?.username ?? "Waiting..."}
            </p>
            <p className="mt-1 text-[#6b3f1d]">
              Last roll: {gameState.lastRoll ?? "—"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-5">
            {isHost ? (
              <>
                <button
                  onClick={handleRollDice}
                  disabled={gameState.gameStatus !== "idling"}
                  className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Force Roll
                </button>
                <button
                  onClick={handleSkipTurn}
                  disabled={gameState.gameStatus !== "idling"}
                  className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Skip Turn
                </button>
                <button
                  onClick={handleEndGame}
                  className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
                >
                  End Game
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleRollDice}
                disabled={
                  currentPlayer?.uid !== uid ||
                  gameState.gameStatus !== "idling"
                }
                className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Roll Dice
              </button>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
