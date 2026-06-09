import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

type StartOfTurnOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
  mode?: "startOfTurn" | "rollingDice" | "tokenAdvancing";
};

export default function StartOfTurnOverlay({
  gameState,
  isActivePlayer,
  mode = "startOfTurn",
}: StartOfTurnOverlayProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const diceValue =
    (gameState as unknown as { lastRoll?: number; diceResult?: number }).lastRoll ??
    (gameState as unknown as { lastRoll?: number; diceResult?: number }).diceResult ??
    "?";

  return (
    <GameOverlayShell>
      {mode === "startOfTurn" && (
        <>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
            Current Turn
          </p>

          <h2 className="text-[36px] font-extrabold text-[#160f08]">
            {currentPlayer?.username}
          </h2>

          <p className="mt-4 text-lg font-semibold text-[#6b3f1d]">
            {isActivePlayer
              ? "It is your turn. Get ready to roll."
              : "Waiting for the current player to roll."}
          </p>
        </>
      )}

      {mode === "rollingDice" && (
        <>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
            Dice Rolling
          </p>

          <div className="mx-auto mb-5 flex h-[110px] w-[110px] items-center justify-center rounded-[22px] border-[7px] border-[#6b3f1d] bg-[#fff4dc] text-[56px] font-extrabold text-[#160f08] shadow-lg">
            {diceValue}
          </div>

          <h2 className="text-[28px] font-extrabold text-[#160f08]">
            {currentPlayer?.username} rolled {diceValue}
          </h2>

          <p className="mt-4 text-lg font-semibold text-[#6b3f1d]">
            Moving token across the board...
          </p>
        </>
      )}

      {mode === "tokenAdvancing" && (
        <>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
            Token Moving
          </p>

          <h2 className="text-[32px] font-extrabold text-[#160f08]">
            {currentPlayer?.username} is moving
          </h2>

          <p className="mt-4 text-lg font-semibold text-[#6b3f1d]">
            Advancing to position {currentPlayer?.position}
          </p>
        </>
      )}
    </GameOverlayShell>
  );
}