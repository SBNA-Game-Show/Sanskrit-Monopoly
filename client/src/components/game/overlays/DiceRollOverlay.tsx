import { useEffect, useRef, useState } from "react";
import { getDiceFaceUrl } from "../../../constants/game/diceFaces";
import type { GameState } from "../../../types/game/gameTypes";
import { ROLL_CYCLES, ROLL_INTERVAL_MS, SETTLE_MS } from "../../../constants/game/diceAnimation";

type DiceRollOverlayProps = {
  gameState: GameState;
  onComplete?: () => void;
};

export function DiceRollOverlay({ gameState, onComplete }: DiceRollOverlayProps) {
  const targetRoll = (gameState as unknown as { lastRoll?: number }).lastRoll ?? null;

  const [displayFace, setDisplayFace] = useState<number>(
    Math.floor(Math.random() * 6) + 1,
  );
  const [pop, setPop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);
  const targetRef = useRef(targetRoll);
  targetRef.current = targetRoll;

  useEffect(() => {
    // Trigger entrance animation on next tick
    const mountTimeout = setTimeout(() => setMounted(true), 10);

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
          setTimeout(() => {
            setPop(false);
            onComplete?.();
          }, SETTLE_MS);
        }, 50);
      }
    }, ROLL_INTERVAL_MS);

    return () => {
      clearTimeout(mountTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRoll]);

  // Determine scaling/rotation depending on entrance vs pop state
  let transformValue = "scale(0.3) rotate(-180deg)";
  if (mounted) {
    transformValue = pop ? "scale(1.25) rotate(10deg)" : "scale(1) rotate(0deg)";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/45">
      <img
        src={getDiceFaceUrl(displayFace)}
        alt={`Dice face ${displayFace}`}
        style={{
          transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out",
          transform: transformValue,
          opacity: mounted ? 1 : 0,
        }}
        className="h-[140px] w-[140px] object-contain drop-shadow-2xl"
      />
    </div>
  );
}
