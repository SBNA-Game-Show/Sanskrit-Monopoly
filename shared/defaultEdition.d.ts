import type { GameEdition, GameTile } from "./gameTypes";

// Type declarations let the client import the shared JavaScript default edition safely.
export declare const BOARD_TILES: Omit<GameTile, "id">[];

// The runtime object includes an id for lookup convenience, even though game state only needs edition data.
export declare const DEFAULT_EDITION: GameEdition & {
  id: string;
};
