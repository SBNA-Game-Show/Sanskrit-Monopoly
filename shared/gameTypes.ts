export type GameStatus = "waiting" | "playing" | "finished";

// seperate in-game phase field
// will be used for the mini-games
export type GamePhase =
  | "startOfTurn"
  | "idling"
  | "rollingDice"
  | "tokenAdvancing"
  | "chance"
  | "community"
  | "popQuiz"
  | "verseChallenge"
  | "penaltyActivity"
  | "miniGame"
  | "turnEnded";

export type GameTileType =
  | "start"
  | "corner"
  | "property"
  | "special"
  | "tax"
  | "railroad"
  | "utility"
  | "penalty"
  | "reward";

export type GameTile = {
  id: string;
  name: string;
  type: GameTileType;
  color?: string;
  points?: number;
  price?: number;
  rent?: number;
  amount?: number;
  group?: string;
  description?: string;
};

export type GameEdition = {
  // id and name optional for now
  id?: string;
  name?: string;
  startingPoints: number;
  tiles: GameTile[];
};

export type QuizOption = {
  id: string;
  text: string;
};

export type ActiveQuiz = {
  id: string;
  question: string;
  options: QuizOption[];

  // Keep optional because clients may not need to know the answer until reveal phase
  correctOptionId?: string;

  // player uid -> option id
  answers: Record<string, string>;

  status: "answering" | "revealing" | "closed";
  endsAt: number;
};

export type ActiveCard = {
  id: string;
  title: string;
  message: string;
  points: number;
};

export type PendingAction =
  | {
      type: "buyProperty";
      playerUid: string;
      tileId: string;
      tileName: string;
      price: number;
      canAfford: boolean;
    }
  | {
      type: "bankruptcy";
      playerUid: string;
      playerName: string;
      money: number;
    }
  | {
      type: "jail";
      playerUid: string;
      bail: number;
      canAfford: boolean;
    }
  | null;

export type PlayerState = {
  uid: string;
  username: string;
  socketId: string | null;
  token: string | null;
  position: number;
  points: number;
  money: number; // <- is now being used
  properties: string[]; // <- standard monopoly addition now makes it useable
  jailed: boolean;
  needsBankruptcyResolution: boolean;
  isEliminated: boolean;
  isConnected: boolean;
};

export type GameHost = {
  uid: string;
  username: string;
  socketId: string | null;
};

export type LogEntry = {
  id: string;
  uid: string;
  username: string;
  message: string;
};

export type GameState = {
  lobbyCode: string;
  status: GameStatus;
  gameStatus: GamePhase; // mini-games integration test
  activeQuiz: ActiveQuiz | null; // quiz testing
  activeCard: ActiveCard | null; // chance and community chest
  pendingAction: PendingAction;
  host: GameHost;
  players: PlayerState[];
  edition: GameEdition;
  currentPlayerIndex: number;
  lastRoll: number | null;
  winnerUid: string | null;
  startTime: number | null;
  endTime: number | null;
  log: LogEntry[];
};
