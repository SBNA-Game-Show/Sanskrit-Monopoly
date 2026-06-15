import type { PlayerState } from "../game/gameTypes";
import type { ZimSceneController } from "./zimSceneTypes";

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
  ownedTiles?: Record<string, number>;
};

export type ZimBoardController = ZimSceneController<ZimBoardState>;

export type ZimMonopolyBoardProps = ZimBoardState;
