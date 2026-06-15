import { useEffect, useRef, useState } from "react";
import { getDiceFaceUrl } from "../../../constants/game/diceFaces";
import type { GameState } from "../../../types/game/gameTypes";

const ROLL_CYCLES = 6;
const ROLL_INTERVAL_MS = 70;
const SETTLE_MS = 200;

type DiceRollOverlayProps = {
  gameState: GameState;
};

export function DiceRollOverlay({ gameState }: DiceRollOverlayProps) {
  const targetRoll = (gameState as unknown as { lastRoll?: number }).lastRoll ?? null;

  const [displayFace, setDisplayFace] = useState<number>(
    Math.floor(Math.random() * 6) + 1,
  );
  const [pop, setPop] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);
  const targetRef = useRef(targetRoll);
  targetRef.current = targetRoll;

  useEffect(() => {
    frameRef.current = 0;
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

        setTimeout(() => {
          setPop(true);
          setTimeout(() => setPop(false), SETTLE_MS);
        }, 50);
      }
    }, ROLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRoll]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/45">
      <img
        src={getDiceFaceUrl(displayFace)}
        alt={`Dice face ${displayFace}`}
        style={{
          transition: pop ? "transform 0.08s ease-out" : "transform 0.15s ease-in",
          transform: pop ? "scale(1.25)" : "scale(1)",
        }}
        className="h-[140px] w-[140px] object-contain drop-shadow-2xl"
      />
    </div>
  );
}
