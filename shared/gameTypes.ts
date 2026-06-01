export type GameStatus = "waiting" | "playing" | "finished";

export type GameTileType =
  | "start"
  | "reward"
  | "penalty"
  | "property"
  | "corner"
  | "special";

export type GameTile = {
  id: string;
  name: string;
  type: GameTileType;
  points?: number;
  description?: string;
};

export type GameEdition = {
  id: string;
  name: string;
  startingPoints: number;
  tiles: GameTile[];
};

export type PlayerState = {
  uid: string;
  username: string;
  socketId: string | null;
  token: string | null;
  position: number;
  points: number;
  isConnected: boolean;
};

export type GameHost = {
  uid: string;
  username: string;
  socketId: string | null;
};

export type GameState = {
  lobbyCode: string;
  status: GameStatus;
  host: GameHost;
  players: PlayerState[];
  edition: GameEdition;
  turnOrder: string[];
  currentTurnUid: string | null;
  lastRoll: number | null;
  winnerUid: string | null;
};
