import { useState } from "react";
import ZimMonopolyBoard from "../components/ZImMonopolyBoard";
import { socket } from "../socket";
import type { LobbyState, MonopolyGame } from "../types/game";

type AdminGameProps = {
  gameState?: LobbyState;
};

type AdminModal = "penalties" | "rewards" | "questions" | "settings" | null;

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

function AdminGame({ gameState }: AdminGameProps) {
  const [activeModal, setActiveModal] = useState<AdminModal>(null);
  const [notice, setNotice] = useState("");

  const game = gameState?.game || mockGame;
  const players = game.players;
  const currentPlayer = players[game.currentPlayerIndex];
  const lobbyCode = gameState?.lobbyCode;

  function emitAdmin(eventName: string, payload: Record<string, unknown> = {}) {
    if (!lobbyCode) {
      setNotice("Admin actions will sync after starting a live lobby.");
      return;
    }

    socket.emit(eventName, { lobbyCode, ...payload });
  }

  function handleForceRoll() {
    emitAdmin("game-admin-force-roll");
  }

  function handleNextTurn() {
    emitAdmin("game-admin-next-turn");
  }

  function handleAdjustScore(playerId: number, amount: number) {
    emitAdmin("game-admin-adjust-score", { playerId, amount });
  }

  function handleRemovePlayer(playerId: number) {
    const confirmed = confirm("Remove this player from the game?");
    if (!confirmed) return;
    emitAdmin("game-admin-remove-player", { playerId });
  }

  function renderModalContent() {
    if (activeModal === "penalties") {
      return (
        <>
          <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">Manage Penalties / दण्डाः</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-bold">Penalty Title</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="शब्द-परीक्षा" />
            </label>
            <label className="block">
              <span className="mb-1 block font-bold">Penalty Rule</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="Landing on penalty tile deducts 50 points." />
            </label>
          </div>
        </>
      );
    }

    if (activeModal === "rewards") {
      return (
        <>
          <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">Manage Rewards / पुरस्काराः</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-bold">Reward Title</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="पुरस्कारः" />
            </label>
            <label className="block">
              <span className="mb-1 block font-bold">Reward Rule</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="Landing on reward tile adds 100 points." />
            </label>
          </div>
        </>
      );
    }

    if (activeModal === "questions") {
      return (
        <>
          <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">Questions / प्रश्नाः</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-bold">Simple Question Title</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="What does जलम् mean?" />
            </label>
            <label className="block">
              <span className="mb-1 block font-bold">Correct Answer</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="Water" />
            </label>
          </div>
        </>
      );
    }

    if (activeModal === "settings") {
      return (
        <>
          <h2 className="mb-4 text-[28px] font-bold text-[#ff514b]">Game Settings</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-bold">Players</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="Minimum 2 players, maximum 4 players" />
            </label>
            <label className="block">
              <span className="mb-1 block font-bold">Turn Order</span>
              <input className="w-full rounded-xl border-2 border-[#ffa23b] bg-[#fff4dc] p-3" defaultValue="Dynamic turn order based on current players" />
            </label>
          </div>
        </>
      );
    }

    return null;
  }

  return (
    <main className="min-h-screen w-full bg-[#161616] font-sans text-[#160f08]">
      <section className="grid min-h-screen grid-cols-[340px_1fr_340px] gap-6 bg-[#fffaf0] p-6">
        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-5 shadow-xl">
          <h2 className="mb-5 text-[28px] font-bold leading-none text-[#ff514b]">
            Players
            <span className="mt-1 block text-[22px]">क्रीडकाः</span>
          </h2>

          <p className="mb-4 rounded-2xl bg-[#fff4dc] p-3 text-center text-sm font-bold text-[#6b3f1d]">
            Add players from the lobby before starting. Game supports 2–4 players.
          </p>

          <div className="space-y-5">
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
                    <p className="font-semibold">Player {index + 1} — {player.username}</p>
                    <p>धनम्: {player.money}</p>
                    <p>Points: {player.score}</p>
                    <p>Position: {player.position}</p>
                    <p>Status: {player.status}</p>
                  </div>

                  <div className="flex h-[64px] w-[74px] shrink-0 items-center justify-center rounded-xl bg-white/25 text-[42px] grayscale">
                    {player.token}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => handleAdjustScore(player.id, 50)}
                    className="rounded-full bg-[#274c3b] px-4 py-2 text-xs font-bold text-white shadow"
                  >
                    +50
                  </button>
                  <button
                    onClick={() => handleAdjustScore(player.id, -50)}
                    className="rounded-full bg-[#e84a15] px-4 py-2 text-xs font-bold text-white shadow"
                  >
                    -50
                  </button>
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className="rounded-full bg-[#b33a3a] px-4 py-2 text-xs font-bold text-white shadow"
                  >
                    Remove
                  </button>
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

          <div className="flex flex-1 items-center justify-center rounded-[22px] border-[12px] border-[#6b3f1d] bg-[#202733] p-4 shadow-2xl">
            <div className="aspect-square h-full max-h-[calc(100vh-190px)] w-full max-w-[calc(100vh-190px)]">
              <ZimMonopolyBoard
                positions={players.map((player) => player.position)}
                currentPlayerIndex={game.currentPlayerIndex}
                diceValue={game.diceResult}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-8">
            <button
              onClick={handleForceRoll}
              className="h-[52px] min-w-[170px] rounded-[20px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
            >
              Force Roll
            </button>
            <button
              onClick={handleNextTurn}
              className="h-[52px] min-w-[170px] rounded-[20px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
            >
              Skip Turn
            </button>
          </div>
        </section>

        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-6 shadow-xl">
          <h2 className="mb-7 text-[26px] font-bold text-[#ff514b]">Admin Controls</h2>

          <div className="flex flex-col items-center gap-5">
            <button onClick={() => setActiveModal("penalties")} className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]">
              Penalties
            </button>
            <button onClick={() => setActiveModal("rewards")} className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]">
              Rewards
            </button>
            <button onClick={() => setActiveModal("questions")} className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]">
              Questions
            </button>
            <button onClick={() => setActiveModal("settings")} className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]">
              Settings
            </button>
          </div>

          <div className="mt-12 rounded-2xl bg-[#fff4dc] p-4 text-[18px] leading-tight shadow-inner">
            <p className="mb-2 font-bold">Game State</p>
            Current Player: {currentPlayer?.username || "None"}
            <br />
            Dice Result: {game.diceResult ?? "—"}
            <br />
            Tile Landed: {game.tileLanded}
            <br />
            Last Action: {game.lastAction}
          </div>
        </aside>
      </section>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-3xl border-[8px] border-[#ffa23b] bg-[#f5bd78] p-6 shadow-2xl">
            {renderModalContent()}
            <div className="mt-7 flex justify-end gap-4">
              <button
                onClick={() => setActiveModal(null)}
                className="h-[48px] min-w-[130px] rounded-[18px] border-[5px] border-[#ffa23b] bg-[#fff4dc] px-6 font-bold text-[#160f08] shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNotice("Saved on frontend. Backend config storage can be connected later.");
                  setActiveModal(null);
                }}
                className="h-[48px] min-w-[130px] rounded-[18px] border-[5px] border-[#ffa23b] bg-[#e84a15] px-6 font-bold text-white shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[360px] rounded-2xl border-[5px] border-[#ffa23b] bg-[#f5bd78] p-4 shadow-2xl">
          <p className="text-base font-bold">{notice}</p>
          <button onClick={() => setNotice("")} className="mt-3 rounded-xl bg-[#e84a15] px-4 py-2 text-sm font-bold text-white">
            Close
          </button>
        </div>
      )}
    </main>
  );
}

export default AdminGame;
