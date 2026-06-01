import { useState } from "react";
import ZimMonopolyBoard from "../components/ZImMonopolyBoard";
import { socket } from "../socket";
import type { LobbyState, MonopolyGame } from "../types/game";

type GameProps = {
  gameState?: LobbyState;
};

const mockGame: MonopolyGame = {
  selectedEdition: "TEMPLE",
  startingMoney: 500,
  players: [
    { id: 1, username: "XYZ", money: 500, score: 0, position: 0, status: "Active", token: "🐘", properties: 0 },
    { id: 2, username: "ABC", money: 500, score: 0, position: 0, status: "Active", token: "👟", properties: 0 },
  ],
  currentPlayerIndex: 0,
  diceResult: null,
  tileLanded: "आरम्भः",
  lastAction: "Waiting for dice roll.",
  lastEffect: "start",
  turnNumber: 1,
};

function Game({ gameState }: GameProps) {
  const [popupMessage, setPopupMessage] = useState("");

  const game = gameState?.game || mockGame;
  const players = game.players;
  const currentPlayer = players[game.currentPlayerIndex];
  const currentUserPlayerIndex = players.findIndex((player) => player.socketId === socket.id);
  const myPlayerIndex = currentUserPlayerIndex >= 0 ? currentUserPlayerIndex : 0;
  const myPlayer = players[myPlayerIndex];
  const isMyTurn = currentPlayer?.socketId === socket.id || !gameState;
  const lobbyCode = gameState?.lobbyCode;

  function emitPlayerAction(action: "buy-property" | "collect-rent" | "chance") {
    if (!lobbyCode) {
      setPopupMessage("This action will work after joining a live lobby.");
      return;
    }

    socket.emit("game-player-action", { lobbyCode, action });
  }

  function handleRollDice() {
    if (!lobbyCode) {
      setPopupMessage("Dice roll will sync after joining a live lobby.");
      return;
    }

    socket.emit("game-roll-dice", { lobbyCode });
  }

  return (
    <main className="min-h-screen w-full bg-[#161616] font-sans text-[#160f08]">
      <section className="grid min-h-screen grid-cols-[320px_1fr_330px] gap-6 bg-[#fffaf0] p-6">
        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-5 shadow-xl">
          <h2 className="mb-5 text-[28px] font-bold leading-none text-[#ff514b]">
            Players
            <span className="mt-1 block text-[22px]">क्रीडकाः</span>
          </h2>

          <div className="space-y-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`rounded-2xl border-[6px] p-4 shadow-md ${
                  index === game.currentPlayerIndex
                    ? "border-[#6b3f1d] bg-[#ffd7a3]"
                    : "border-[#ffa23b] bg-[#ffb45c]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[15px] leading-[1.45]">
                    <p className="font-semibold">
                      {index === myPlayerIndex ? "YOU" : `Player ${index + 1}`} — {player.username}
                    </p>
                    <p>धनम्: {player.money}</p>
                    <p>Points: {player.score}</p>
                    <p>Position: {player.position}</p>
                    <p>Status: {player.status}</p>
                  </div>

                  <div className="flex h-[64px] w-[74px] shrink-0 items-center justify-center rounded-xl bg-white/25 text-[42px] grayscale">
                    {player.token}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <div className="mb-4 rounded-2xl bg-[#f5bd78] px-6 py-4 shadow-md">
            <p className="text-[16px] font-semibold text-[#6b3f1d]">Room Code</p>
            <h2 className="text-[30px] font-extrabold tracking-wide text-[#160f08]">
              {gameState?.lobbyCode || "Preview"}
            </h2>
          </div>

          <div className="relative flex flex-1 items-center justify-center rounded-[22px] border-[12px] border-[#6b3f1d] bg-[#202733] p-4 shadow-2xl">
            <div className="aspect-square h-full max-h-[calc(100vh-190px)] w-full max-w-[calc(100vh-190px)]">
              <ZimMonopolyBoard
                positions={players.map((player) => player.position)}
                currentPlayerIndex={game.currentPlayerIndex}
                diceValue={game.diceResult}
              />
            </div>
          </div>
        </section>

        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-6 shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => emitPlayerAction("buy-property")}
              className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
            >
              Buy Property
            </button>

            <button
              onClick={() => emitPlayerAction("collect-rent")}
              className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
            >
              Collect Rent
            </button>

            <button
              onClick={() => emitPlayerAction("chance")}
              className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
            >
              Chance
            </button>

            <button
              onClick={() => setPopupMessage("Community Chest questions will be connected later.")}
              className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-base font-bold text-white shadow-md hover:bg-[#ff7a2f]"
            >
              Community Chest
            </button>

            <button
              onClick={() => setPopupMessage("Leave game will be connected later.")}
              className="h-[58px] w-[220px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#b33a3a] text-lg font-bold text-white shadow-md hover:bg-[#d94a4a]"
            >
              Leave Game
            </button>
          </div>

          <div className="mt-12 rounded-2xl bg-[#fff4dc] p-4 text-[19px] leading-tight shadow-inner">
            <p className="mb-2 font-bold">Your Stats</p>
            Player: {myPlayer?.username || "None"}
            <br />
            Position: {myPlayer?.position ?? 0}
            <br />
            धनम्: {myPlayer?.money ?? 0}
            <br />
            Points: {myPlayer?.score ?? 0}
            <br />
            Properties: {myPlayer?.properties ?? 0}
          </div>

          <div className="mt-8 rounded-2xl bg-[#fff4dc] p-4 text-[17px] leading-tight shadow-inner">
            <p className="mb-2 font-bold">Game State</p>
            Current Turn: {currentPlayer?.username || "None"}
            <br />
            Dice Result: {game.diceResult ?? "—"}
            <br />
            Tile Landed: {game.tileLanded}
            <br />
            Last Action: {game.lastAction}
          </div>

          <button
            disabled={!isMyTurn}
            onClick={handleRollDice}
            className={`mt-8 h-[58px] w-full rounded-[22px] border-[6px] border-[#ffa23b] text-lg font-bold text-white shadow-md ${
              isMyTurn ? "bg-[#e84a15] hover:bg-[#ff7a2f]" : "cursor-not-allowed bg-gray-400 opacity-70"
            }`}
          >
            Roll Dice
          </button> 
        </aside>
      </section>

      {popupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
          <div className="w-full max-w-[480px] rounded-3xl border-[8px] border-[#ffa23b] bg-[#f5bd78] p-6 shadow-2xl">
            <h2 className="mb-3 text-[28px] font-bold text-[#ff514b]">Message</h2>
            <p className="mb-6 text-lg leading-relaxed">{popupMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setPopupMessage("")}
                className="h-[48px] min-w-[130px] rounded-[18px] border-[5px] border-[#ffa23b] bg-[#e84a15] px-6 font-bold text-white shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Game;
