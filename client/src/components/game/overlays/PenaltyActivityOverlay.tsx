import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

type PenaltyActivityOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
  mode?: "activity" | "result";
};

function getCurrentTile(gameState: GameState) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  if (!currentPlayer) return undefined;

  return gameState.edition.tiles[currentPlayer.position];
}

export function PenaltyActivityOverlay({
  gameState,
  isActivePlayer,
  mode = "activity",
}: PenaltyActivityOverlayProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentTile = getCurrentTile(gameState);

  if (mode === "result") {
    const tileType = currentTile?.type ?? "site";
    const tileName = currentTile?.name ?? "Unknown Tile";
    const points = currentTile?.points ?? 0;

    const isRewardTile = tileType === "reward";
    const isPenaltyTile = tileType === "penalty";
    const isSiteTile = tileType === "site";
    const isSpecialTile = tileType === "special";
    const isCornerTile = tileType === "corner" || tileType === "start";

    let tileTitle = "Tile Result";
    let tileDescription = "You landed on this tile.";
    let resultText = "No point change";
    let resultColor = "text-[#6b3f1d]";

    if (isRewardTile) {
      tileTitle = "Reward Tile";
      tileDescription = "You received a reward for landing here.";
      resultText = points > 0 ? `+${points} points` : "Reward received";
      resultColor = "text-[#1f7a3f]";
    } else if (isPenaltyTile) {
      tileTitle = "Penalty Tile";
      tileDescription = "Penalty activity will be shown.";
      resultText = points < 0 ? `₩{points} points` : "Penalty activity";
      resultColor = "text-[#b33a3a]";
    } else if (isSiteTile) {
      tileTitle = "Cultural Site";
      tileDescription =
        "This site can be owned, purchased, or used for rent rules.";
      resultText = "Rent / buy property action available";
      resultColor = "text-[#6b3f1d]";
    } else if (isSpecialTile) {
      tileTitle = "Special Tile";
      tileDescription = "This tile can trigger a special game event.";
      resultText = "Special action available";
      resultColor = "text-[#6b3f1d]";
    } else if (isCornerTile) {
      tileTitle = "Corner Tile";
      tileDescription = "You landed on a board corner.";
      resultText = "No point change";
      resultColor = "text-[#6b3f1d]";
    }

    return (
      <GameOverlayShell>
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
          Turn Result
        </p>

        <h2 className="text-[30px] font-extrabold text-[#160f08]">
          {currentPlayer?.username} landed on
        </h2>

        <p className="mt-3 text-[30px] font-extrabold text-[#6b3f1d]">
          {tileName}
        </p>

        <div className="mt-5 rounded-2xl bg-[#fff4dc] px-5 py-4 shadow-inner">
          <p className="text-lg font-bold text-[#160f08]">{tileTitle}</p>

          <p className="mt-2 text-base font-semibold text-[#6b3f1d]">
            {tileDescription}
          </p>

          <p className={`mt-3 text-[24px] font-extrabold ₩{resultColor}`}>
            {resultText}
          </p>
        </div>
      </GameOverlayShell>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <div className="w-full max-w-[560px] rounded-[28px] border-[8px] border-[#ffa23b] bg-[#f5bd78] p-7 text-center shadow-2xl">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
          Penalty Activity
        </p>

        <h2 className="text-[34px] font-extrabold text-[#160f08]">Mini Game</h2>

        <p className="mt-2 text-base font-semibold text-[#6b3f1d]">
          {currentPlayer?.username} must complete this quick challenge.
        </p>

        <div className="mx-auto mt-5 flex h-[48px] w-[120px] items-center justify-center rounded-full bg-[#e84a15] text-lg font-extrabold text-white shadow-md">
          00:20
        </div>

        <div className="mt-6 rounded-2xl bg-[#fff4dc] p-5 shadow-inner">
          <p className="text-lg font-bold text-[#160f08]">
            Match the Sanskrit word to the correct meaning.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border-[5px] border-dashed border-[#ffa23b] bg-white/60 px-4 py-5 font-bold text-[#6b3f1d]">
              जलम्
            </div>

            <div className="rounded-2xl border-[5px] border-[#ffa23b] bg-[#e84a15] px-4 py-5 font-bold text-white">
              Water
            </div>
          </div>
        </div>

        <button
          disabled={!isActivePlayer}
          className={`mt-5 h-[54px] w-full rounded-2xl border-[5px] border-[#ffa23b] text-lg font-extrabold shadow-md ${
            isActivePlayer
              ? "bg-[#e84a15] text-white hover:bg-[#ff7a2f]"
              : "cursor-not-allowed bg-gray-400 text-white opacity-70"
          }`}
        >
          Complete Activity
        </button>

        {!isActivePlayer && (
          <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
            Everyone can see the activity, but only the current player can
            participate.
          </p>
        )}
      </div>
    </div>
  );
}
