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
  const activePlayers = useMemo(
    () => players.filter((player) => !player.isEliminated),
    [players],
  );

  const ownedTiles = useMemo(() => {
    const ownershipByTileId: Record<string, string> = {};

    players.forEach((player) => {
      if (!player.token) return;

      player.properties.forEach((tileId) => {
        ownershipByTileId[tileId] = player.token;
      });
    });

    return ownershipByTileId;
  }, [players]);

  const boardState = useMemo<ZimBoardState>(
    () => ({
      players: activePlayers,
      currentTurnUid,
      lastRoll,
      ownedTiles,
    }),
    [activePlayers, currentTurnUid, lastRoll, ownedTiles],
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
