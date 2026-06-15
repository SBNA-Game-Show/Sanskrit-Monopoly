import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

type BankruptcyOverlayProps = {
  gameState: GameState;
  isHost: boolean;
  onResolveBankruptcy: (bankruptPlayerUid: string) => void;
};

export function BankruptcyOverlay({
  gameState,
  isHost,
  onResolveBankruptcy,
}: BankruptcyOverlayProps) {
  const action = gameState.pendingAction;

  if (!action || action.type !== "bankruptcy") return null;

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
        Bankruptcy Pending
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">
        {action.playerName}
      </h2>

      <p className="mt-4 text-lg font-semibold text-[#6b3f1d]">
        This player is below ₩0 with a balance of{" "}
        <span className="font-extrabold">
          {action.money < 0
            ? `-₩${Math.abs(action.money)}`
            : `₩${action.money}`}
        </span>
        .
      </p>

      {isHost ? (
        <button
          type="button"
          onClick={() => onResolveBankruptcy(action.playerUid)}
          className="mt-7 rounded-full bg-[#b33a3a] px-8 py-3 text-base font-extrabold text-white shadow-md hover:bg-[#d9534f]"
        >
          Eliminate Player
        </button>
      ) : (
        <p className="mt-6 text-base font-bold text-[#6b3f1d]">
          Waiting for the host to resolve bankruptcy.
        </p>
      )}
    </GameOverlayShell>
  );
}
