export type GameStatus = "waiting" | "playing" | "finished";

// seperate in-game phase field
// will be used for the mini-games
export type GamePhase =
  | "startOfTurn"
  | "idling"
  | "rollingDice"
  | "chance"
  | "tokenAdvancing"
  | "popQuiz"
  | "verseChallenge"
  | "penaltyActivity"
  | "miniGame"
  | "turnEnded";

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

export type PlayerState = {
  uid: string;
  username: string;
  socketId: string | null;
  token: string | null;
  position: number;
  points: number;
  money: number; // currently unused
  properties: string[]; // currently unused
  isConnected: boolean;
};

export type GameHost = {
  uid: string;
  username: string;
  socketId: string | null;
};

export type ActiveCard = {
  id: string;
  title: string;
  message: string;
  points: number;
};

export type GameState = {
  lobbyCode: string;
  status: GameStatus;
  gameStatus: GamePhase; // mini-games integration test
  activeQuiz: ActiveQuiz | null; // quiz testing
  activeCard: ActiveCard | null;
  host: GameHost;
  players: PlayerState[];
  edition: GameEdition;
  currentPlayerIndex: number;
  lastRoll: number | null;
  winnerUid: string | null;
  startTime: number | null;
  endTime: number | null;
};
