import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

export default function StartOfTurnOverlay({
  gameState,
}: {
  gameState: GameState;
}) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  if (!currentPlayer) return null;

  return (
    <GameOverlayShell>
      <h2 className="text-2xl font-bold text-gray-800">
        {currentPlayer.username}&apos;s turn
      </h2>
      <p className="mt-2 text-gray-600">so cool!</p>
    </GameOverlayShell>
  );
}
