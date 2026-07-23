import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

interface CommunityChestOverlayProps {
  gameState: GameState;
  isActivePlayer: boolean;
}

export function CommunityChestOverlay({ gameState, isActivePlayer }: CommunityChestOverlayProps) {
  if (!gameState.activeCard) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
        Community Chest
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">
        {gameState.activeCard.title}
      </h2>

      {currentPlayer && (
        <p className="mt-1 text-sm font-semibold text-[#6b3f1d]">
          {isActivePlayer ? "You drew a card" : `${currentPlayer.username} drew a card`}
        </p>
      )}

      <div className="mt-5 rounded-2xl bg-[#fff4dc] p-5 text-center shadow-inner">
        <p className="text-[20px] leading-relaxed font-semibold text-[#6b3f1d]">
          {gameState.activeCard.message}
        </p>

        {gameState.activeCard.points !== 0 && (
          <p className="mt-4 text-[28px] font-extrabold text-[#e84a15]">
            {gameState.activeCard.points > 0 ? "+" : ""}
            {gameState.activeCard.points} points
          </p>
        )}
      </div>
    </GameOverlayShell>
  );
}