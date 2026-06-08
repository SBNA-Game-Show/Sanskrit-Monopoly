import type { GameState } from "../../../types/game/gameTypes";

type PopQuizOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
};

export function PopQuizOverlay({
  gameState,
  isActivePlayer,
}: PopQuizOverlayProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const options = ["Fire", "Water", "Sky", "Earth"];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <div className="w-full max-w-[560px] rounded-[28px] border-[8px] border-[#ffa23b] bg-[#f5bd78] p-7 text-center shadow-2xl">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
          Penalty Activity
        </p>

        <h2 className="text-[34px] font-extrabold text-[#160f08]">
          Pop Quiz
        </h2>

        <p className="mt-2 text-base font-semibold text-[#6b3f1d]">
          {currentPlayer?.username} must answer this question.
        </p>

        <div className="mx-auto mt-5 flex h-[48px] w-[120px] items-center justify-center rounded-full bg-[#e84a15] text-lg font-extrabold text-white shadow-md">
          00:30
        </div>

        <div className="mt-5 rounded-2xl bg-[#fff4dc] p-5 text-left shadow-inner">
          <p className="text-sm font-extrabold uppercase text-[#6b3f1d]">
            Question
          </p>

          <p className="mt-2 text-[22px] font-bold text-[#160f08]">
            What does जलम् mean?
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {options.map((option) => (
            <button
              key={option}
              disabled={!isActivePlayer}
              className={`rounded-2xl border-[5px] border-[#ffa23b] px-4 py-4 text-lg font-bold shadow-md transition ${
                isActivePlayer
                  ? "bg-[#e84a15] text-white hover:bg-[#ff7a2f]"
                  : "cursor-not-allowed bg-[#fff4dc] text-[#6b3f1d] opacity-70"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {!isActivePlayer && (
          <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
            You can see the question, but only the current player can answer.
          </p>
        )}
      </div>
    </div>
  );
}