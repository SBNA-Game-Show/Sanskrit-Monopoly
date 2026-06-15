//This page is just the overlay, ill add cooler looks to this later... maybe; also ill try to add informal comments for easier merging 

import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

type JailOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
  onPayBail: () => void;
  onGoToJail: () => void;
};

const BAIL_COST = 50;

export function JailOverlay({
  gameState,
  isActivePlayer,
  onPayBail,
  onGoToJail,
}: JailOverlayProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const canAffordBail = (currentPlayer?.points ?? 0) >= BAIL_COST;

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
        Special Tile
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">
        Go To Jail
      </h2>

      <p className="mt-2 text-base font-semibold text-[#6b3f1d]">
        {currentPlayer?.username} landed on the jail tile.
      </p>

      <div className="mt-5 rounded-2xl bg-[#fff4dc] p-5 text-center shadow-inner">
        <p className="text-[22px] font-extrabold text-[#160f08]">
          परीक्षा — कारागारम्
        </p>

        <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
          {isActivePlayer
            ? `Pay ${BAIL_COST} points to skip jail, or go to jail.`
            : "Waiting for the current player to decide."}
        </p>
      </div>

      {!isActivePlayer ? (
        <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
          A player is about to go to jail, or not idk.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={!canAffordBail}
            onClick={onPayBail}
            className={`rounded-2xl border-[5px] border-[#ffa23b] px-4 py-4 text-lg font-bold shadow-md transition ${
              canAffordBail
                ? "bg-[#e84a15] text-white hover:bg-[#ff7a2f]"
                : "cursor-not-allowed bg-gray-400 text-white opacity-70"
            }`}
          >
            Pay {BAIL_COST} & Stay
          </button>

          <button
            type="button"
            onClick={onGoToJail}
            className="rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] px-4 py-4 text-lg font-bold text-[#6b3f1d] shadow-md transition hover:bg-[#ffe8c4]"
          >
            Go To Jail
          </button>
        </div>
      )}

      {isActivePlayer && !canAffordBail && (
        <p className="mt-3 text-sm font-semibold text-[#b33a3a]">
          Not enough points to pay bail, NOT IMPLIMENTED
        </p>
      )}
    </GameOverlayShell>
  );
}