import { useEffect, useRef, useState } from "react";
import { getDiceFaceUrl } from "../../../constants/game/diceFaces";
import { GameOverlayShell } from "./GameOverlayShell";
import type { GameState } from "../../../types/game/gameTypes";

const ROLL_CYCLES = 16;
const ROLL_INTERVAL_MS = 70;
const SETTLE_MS = 300;

type DiceRollOverlayProps = {
  gameState: GameState;
};

export function DiceRollOverlay({ gameState }: DiceRollOverlayProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const targetRoll = (gameState as unknown as { lastRoll?: number }).lastRoll ?? null;

  const [displayFace, setDisplayFace] = useState<number>(
    Math.floor(Math.random() * 6) + 1,
  );
  const [settled, setSettled] = useState(false);
  const [pop, setPop] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);
  const targetRef = useRef(targetRoll);
  targetRef.current = targetRoll;

  useEffect(() => {
    frameRef.current = 0;
    setSettled(false);
    setPop(false);
    setDisplayFace(Math.floor(Math.random() * 6) + 1);

    timerRef.current = setInterval(() => {
      frameRef.current += 1;

      if (frameRef.current < ROLL_CYCLES) {
        setDisplayFace(Math.floor(Math.random() * 6) + 1);
      } else {
        clearInterval(timerRef.current!);
        const final = targetRef.current ?? Math.floor(Math.random() * 6) + 1;
        setDisplayFace(final);

        // pop animation then settle
        setTimeout(() => {
          setPop(true);
          setTimeout(() => {
            setPop(false);
            setSettled(true);
          }, SETTLE_MS);
        }, 50);
      }
    }, ROLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // Only re-run when the roll value itself changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRoll]);

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
        Rolling Dice
      </p>

      <div
        style={{
          transition: pop ? "transform 0.08s ease-out" : "transform 0.15s ease-in",
          transform: pop ? "scale(1.18)" : "scale(1)",
        }}
        className="mx-auto mb-5 flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-[22px] border-[7px] border-[#6b3f1d] bg-[#fff4dc] shadow-lg"
      >
        <img
          src={getDiceFaceUrl(displayFace)}
          alt={`Dice face ${displayFace}`}
          className="h-full w-full object-contain p-2"
        />
      </div>

      <h2 className="text-[28px] font-extrabold text-[#160f08]">
        {settled && targetRoll != null
          ? `${currentPlayer?.username} rolled ${targetRoll}!`
          : `${currentPlayer?.username} is rolling…`}
      </h2>

      {settled && targetRoll != null && (
        <p className="mt-3 text-lg font-semibold text-[#6b3f1d]">
          Moving token across the board…
        </p>
      )}
    </GameOverlayShell>
  );
}
