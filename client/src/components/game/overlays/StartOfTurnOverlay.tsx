import type { GameState } from "../../../types/game/gameTypes";

export default function StartOfTurnOverlay({gameState}: {gameState: GameState}) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800">{currentPlayer.username}'s turn</h2>
        <p className="mt-2 text-gray-600">so cool!</p>
      </div>
    </div>
  );
}
