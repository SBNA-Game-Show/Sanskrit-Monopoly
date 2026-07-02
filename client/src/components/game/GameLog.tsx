import type { GameState } from "../../types/game/gameTypes";
import { useState } from "react";

export function GameLog({ gameState, uid }: { gameState: GameState, uid: string }) {

  // Track if log is collapsed or not
  const {isCollapsed, setIsCollapsed} = useState(false);
  
  return (
    <>
      <style>{gameLogStyles}</style>
      <div className="mt-5 flex flex-col flex-1 min-h-[200px] max-h-[475px]">
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-[#6b3f1d] scrollbar-track-transparent">
          {[...gameState.log].reverse().map((log, index) => (
            <div
              key={log.id}
              className={`rounded-xl border-[#6b3f1d] p-3 shadow-sm ${
                index === 0
                  ? "animate-new-log-entry"
                  : "border-[4px]"
              } ${
                log.uid === uid
                  ? "bg-[#E8E8B5] border-[#2d6a27]"
                  : "bg-[#ffd7a3]"
              }`}
            >
              <p className="font-extrabold text-[15px] text-[#160f08] mb-1">
                {log.username}
              </p>
              <p className="text-[14px] text-[#2a1c12] font-semibold leading-snug">
                <strong>{log.username}</strong> {log.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// inline styling for now until we organize code later
const gameLogStyles = `
  @keyframes log-slide-down {
    0% {
      opacity: 0;
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      border-width: 0px;
      transform: translateY(-20px);
    }
    50% {
      opacity: 0;
      max-height: 120px;
      padding-top: 12px;
      padding-bottom: 12px;
      margin-top: 0px;
      border-width: 4px;
      transform: translateY(-20px);
    }
    100% {
      opacity: 1;
      max-height: 120px;
      padding-top: 12px;
      padding-bottom: 12px;
      border-width: 4px;
      transform: translateY(0);
    }
  }

  .animate-new-log-entry {
    animation: log-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    overflow: hidden;
  }
`;