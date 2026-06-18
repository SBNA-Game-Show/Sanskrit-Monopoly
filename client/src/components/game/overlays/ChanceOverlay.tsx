import type { GameState } from "../../../types/game/gameTypes";

interface ChanceOverlayProps {
  gameState: GameState;
  isActivePlayer: boolean;
}

export function ChanceOverlay({ gameState, isActivePlayer }: ChanceOverlayProps) {

  if (!gameState.activeCard || !isActivePlayer) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
      <div className="w-full max-w-[480px] rounded-3xl border-[8px] border-[#ffa23b] bg-[#fff4dc] p-7 text-center shadow-2xl">
        <h2 className="text-[38px] font-bold text-[#e84a15]">
          Chance Card
        </h2>

        <h3 className="mt-4 text-[26px] font-bold text-[#160f08]">
          {gameState.activeCard.title}
        </h3>

        <p className="mt-4 text-[20px] leading-relaxed text-[#6b3f1d]">
          {gameState.activeCard.message}
        </p>

        <p className="mt-5 text-[28px] font-bold text-[#e84a15]">
          {gameState.activeCard.points > 0 ? "+" : ""}
          {gameState.activeCard.points} points
        </p>
      </div>
    </div>
  );
}