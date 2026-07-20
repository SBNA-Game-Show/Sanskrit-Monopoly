
import { useEffect } from "react";

const REVEAL_MS = 550;

type TileRevealOverlayProps = {
  onComplete: () => void;
};

export function TileRevealOverlay({ onComplete }: TileRevealOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onComplete, REVEAL_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none">
      <style>{`
        /* Ring 1 — fast, tight */
        @keyframes ring1 {
          0%   { transform: scale(0);   opacity: 0.85; }
          100% { transform: scale(10);  opacity: 0;    }
        }
        /* Ring 2 — slightly delayed, wider spread */
        @keyframes ring2 {
          0%   { transform: scale(0);   opacity: 0.55; }
          100% { transform: scale(14);  opacity: 0;    }
        }
        /* Center icon bounce */
        @keyframes iconPop {
          0%   { transform: scale(0)    rotate(-15deg); opacity: 0; }
          55%  { transform: scale(1.2)  rotate(5deg);  opacity: 1; }
          75%  { transform: scale(0.9)  rotate(-2deg); opacity: 1; }
          100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
        }
        /* Whole thing fades out at the end */
        @keyframes containerFade {
          0%,  70% { opacity: 1; }
          100%     { opacity: 0; }
        }

        .tile-reveal-container {
          animation: containerFade ${REVEAL_MS}ms ease-in-out forwards;
        }
        .tile-ring-1 {
          animation: ring1 ${REVEAL_MS * 0.9}ms cubic-bezier(0.2, 0, 0.6, 1) forwards;
        }
        .tile-ring-2 {
          animation: ring2 ${REVEAL_MS}ms cubic-bezier(0.2, 0, 0.6, 1) 60ms forwards;
        }
        .tile-icon-pop {
          animation: iconPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className="tile-reveal-container relative flex items-center justify-center">
        {/* Expanding rings */}
        <div className="tile-ring-1 absolute w-24 h-24 rounded-full bg-[#ffa23b] opacity-0" />
        <div className="tile-ring-2 absolute w-24 h-24 rounded-full bg-[#f5bd78] opacity-0" />

        {/* Center icon */}
        <div className="tile-icon-pop relative z-10 flex h-24 w-24 items-center justify-center rounded-[22px] border-[7px] border-[#6b3f1d] bg-[#f5bd78] shadow-2xl">
          <span className="text-5xl select-none">🎲</span>
        </div>
      </div>
    </div>
  );
}