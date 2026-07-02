import { useMemo } from "react";
import { ZimSceneHost } from "./ZimSceneHost";
import { createZimBoard } from "./createZimBoard";
import type { GameEdition, PlayerState } from "../../types/game/gameTypes";
import type { ZimBoardState } from "../../types/zim/zimBoardTypes";

type ZimMonopolyBoardProps = {
  edition: GameEdition;
  players: PlayerState[];
  currentTurnUid: string | null;
  lastRoll: number | null;
};

export function ZimMonopolyBoard({
  edition,
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
        if (player.token) {
          ownershipByTileId[tileId] = player.token;
        }
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
      edition={edition}
      state={boardState}
      createScene={createZimBoard}
      width={900}
      height={900}
      backgroundColor="#202733"
    />
  );
}
