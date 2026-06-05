import type { PlayerState } from "../game/gameTypes";

export type TileCenter = {
  x: number;
  y: number;
};

export type BoardTileType =
  | "corner"
  | "property"
  | "special"
  | "tax"
  | "railroad"
  | "utility";

export type BoardTileDefinition = {
  name: string;
  type: BoardTileType;
  color: string;
};

export type ZimBoardState = {
  players: PlayerState[];
  currentTurnUid: string | null;
  lastRoll?: number | null;
};

export type ZimBoardController = {
  update: (state: ZimBoardState) => void;
  dispose: () => void;
};

export type ZimMonopolyBoardProps = ZimBoardState;
