import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

type VerseChallengeOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
};

export function VerseChallengeOverlay({
  gameState,
  isActivePlayer,
}: VerseChallengeOverlayProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
        Penalty Activity
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">
        Fill in the Blanks
      </h2>

      <p className="mt-2 text-base font-semibold text-[#6b3f1d]">
        {currentPlayer?.username} must complete the phrase.
      </p>

      <div className="mx-auto mt-5 flex h-[48px] w-[120px] items-center justify-center rounded-full bg-[#e84a15] text-lg font-extrabold text-white shadow-md">
        00:45
      </div>

      <div className="mt-5 rounded-2xl bg-[#fff4dc] p-5 text-center shadow-inner">
        <p className="text-[24px] font-extrabold text-[#160f08]">
          सत्यम् ____ धर्मं चर
        </p>

        <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
          Fill the missing Sanskrit word.
        </p>
      </div>

      <input
        disabled={!isActivePlayer}
        placeholder={
          isActivePlayer ? "Type answer here..." : "Waiting for current player"
        }
        className="mt-5 w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] px-5 py-4 text-center text-lg font-bold text-[#160f08] outline-none disabled:cursor-not-allowed disabled:opacity-70"
      />

      <button
        disabled={!isActivePlayer}
        className={`mt-5 h-[54px] w-full rounded-2xl border-[5px] border-[#ffa23b] text-lg font-extrabold shadow-md ${
          isActivePlayer
            ? "bg-[#e84a15] text-white hover:bg-[#ff7a2f]"
            : "cursor-not-allowed bg-gray-400 text-white opacity-70"
        }`}
      >
        Submit Answer
      </button>
    </GameOverlayShell>
  );
}