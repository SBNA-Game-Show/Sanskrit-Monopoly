import { useMemo } from "react";
import { ZimSceneHost } from "./ZimSceneHost";
import { createZimBoard } from "./createZimBoard";
import type { PlayerState } from "../../types/game/gameTypes";
import type { ZimBoardState } from "../../types/zim/zimBoardTypes";

type ZimMonopolyBoardProps = {
  players: PlayerState[];
  currentTurnUid: string | null;
  lastRoll: number | null;
};

export function ZimMonopolyBoard({
  players,
  currentTurnUid,
  lastRoll,
}: ZimMonopolyBoardProps) {
  const boardState = useMemo<ZimBoardState>(
    () => ({
      players,
      currentTurnUid,
      lastRoll,
    }),
    [players, currentTurnUid, lastRoll],
  );

  return (
    <ZimSceneHost
      state={boardState}
      createScene={createZimBoard}
      width={900}
      height={900}
      backgroundColor="#202733"
    />
  );
}
