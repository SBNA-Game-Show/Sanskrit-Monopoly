import { useMemo, useEffect, useRef } from "react";
import { ZimSceneHost } from "./ZimSceneHost";
import { createZimBoard } from "./createZimBoard";
import type { GameEdition, GamePhase, PlayerState } from "../../types/game/gameTypes";
import type { ZimBoardState } from "../../types/zim/zimBoardTypes";
import type { ZimBoardController } from "../../types/zim/zimBoardTypes";

function withRollerAtFrom(
  boardState: ZimBoardState,
  playerIndex: number,
  fromPosition: number,
): ZimBoardState {
  return {
    ...boardState,
    players: boardState.players.map((p, i) =>
      i === playerIndex ? { ...p, position: fromPosition } : p,
    ),
  };
}

type ZimMonopolyBoardProps = {
  edition: GameEdition;
  players: PlayerState[];
  currentTurnUid: string | null;
  lastRoll: number | null;
  gameStatus: GamePhase;
  diceRollCompleteKey?: number;
};

export function ZimMonopolyBoard({
  edition,
  players,
  currentTurnUid,
  lastRoll,
  gameStatus,
  diceRollCompleteKey,
}: ZimMonopolyBoardProps) {
  const controllerRef = useRef<ZimBoardController | null>(null);
  const lastAnimatedRollRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{
    playerIndex: number;
    from: number;
    to: number;
  } | null>(null);
  const activePlayers = useMemo(
    () => players.filter((player) => !player.isEliminated),
    [players],
  );

  const ownedTiles = useMemo(() => {
    const ownershipByTileId: Record<string, string> = {};

    players.forEach((player) => {
      const token = player.token;
      if (!token) return;

      player.properties.forEach((tileId) => {
        ownershipByTileId[tileId] = token;
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

  useEffect(() => {
    if (!controllerRef.current) return;

    const rollerIndex = activePlayers.findIndex((p) => p.uid === currentTurnUid);
    const roller = rollerIndex >= 0 ? activePlayers[rollerIndex] : null;

    if (lastRoll == null) {
      lastAnimatedRollRef.current = null;
      pendingMoveRef.current = null;
      controllerRef.current.update(boardState);
      return;
    }

    const isNewRoll =
      gameStatus === "rollingDice" &&
      roller != null &&
      lastRoll !== lastAnimatedRollRef.current;

    if (isNewRoll) {
      lastAnimatedRollRef.current = lastRoll;
      const from = (roller.position - lastRoll + 40) % 40;
      const to = roller.position;

      pendingMoveRef.current = { playerIndex: rollerIndex, from, to };

      controllerRef.current.update(
        withRollerAtFrom(boardState, rollerIndex, from),
      );
    }

    if (gameStatus === "rollingDice" || pendingMoveRef.current) {
      return;
    }

    controllerRef.current.update(boardState);
  }, [boardState, lastRoll, gameStatus, activePlayers, currentTurnUid]);

  useEffect(() => {
    const move = pendingMoveRef.current;
    if (!move || diceRollCompleteKey === 0) return;

    pendingMoveRef.current = null;
    controllerRef.current?.slideCurrentPlayer(
      move.playerIndex,
      move.from,
      move.to,
    );
  }, [diceRollCompleteKey]);

  return (
    <ZimSceneHost
      edition={edition}
      state={boardState}
      createScene={createZimBoard}
      autoUpdate={false}
      onControllerReady={(c) => {
        controllerRef.current = c as ZimBoardController;
        c.update(boardState);
      }}
      width={900}
      height={900}
      backgroundColor="#202733"
    />
  );
}
