import { useEffect, useRef } from "react";
import * as zim from "zimjs";
import { createZimBoard } from "./createZimBoard";
import type {
  ZimBoardController,
  ZimMonopolyBoardProps,
} from "./zimBoardTypes";

export default function ZimMonopolyBoard({
  players,
  currentTurnUid,
}: ZimMonopolyBoardProps) {
  const holderIdRef = useRef(
    `zim-board-${Math.random().toString(36).slice(2)}`,
  );
  const frameRef = useRef<zim.Frame | null>(null);
  const stageRef = useRef<zim.Stage | null>(null);
  const boardRef = useRef<ZimBoardController | null>(null);
  const latestStateRef = useRef({ players, currentTurnUid });

  useEffect(() => {
    latestStateRef.current = { players, currentTurnUid };
    boardRef.current?.update(latestStateRef.current);
  }, [players, currentTurnUid]);

  useEffect(() => {
    frameRef.current = new zim.Frame({
      scaling: holderIdRef.current,
      width: 900,
      height: 900,
      color: "#202733",
      ready: () => {
        if (!frameRef.current) return;

        stageRef.current = frameRef.current.stage;
        boardRef.current = createZimBoard(
          frameRef.current.stage,
          latestStateRef.current,
        );
      },
    });

    return () => {
      boardRef.current?.dispose();
      frameRef.current?.dispose?.();

      boardRef.current = null;
      stageRef.current = null;
      frameRef.current = null;

      const holder = document.getElementById(holderIdRef.current);

      if (holder) {
        holder.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div
        id={holderIdRef.current}
        className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full"
      />
    </div>
  );
}
