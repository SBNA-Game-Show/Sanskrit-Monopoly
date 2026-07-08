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
  | "buyProperty"
  | "jail"
  | "bankruptcy"
  | "auction"
  | "bankruptcyAuction"
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
  | "reward"
  | "chance"
  | "community"
  | "jail";

export type GameTile = {
  id: string;
  name: string;
  type: GameTileType;
  color?: string;
  points?: number;
  price?: number;
  rent?: number;
  sellValue?: number;
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

export type ActiveQuiz = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  status: "answering" | "correct" | "incorrect" | "timerExpired";
  endsAt: number;
};

// basic auction state. Might add more 
export type ActiveAuction = {
  tileId: string;
  highestBid: number;
  highestBidderUid: string | null;
  source?: "declinedProperty" | "bankruptcy";
  bankruptPlayerUid?: string | null;
};

// for auctioning properties from bankrupt player
export type ActiveBankruptcyAuction = {
  bankruptPlayerUid: string;
  bankruptPlayerName: string;
  propertyIds: string[]; // Properties waiting for host auction/clear decisions
};

export type ActiveCard = {
  id: string;
  title: string;
  message: string;
  points: number;
};

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
  isBankrupt: boolean;
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
  isPrivate: boolean;
  status: GameStatus;
  gameStatus: GamePhase; // mini-games integration test
  activeQuiz: ActiveQuiz | null; // quiz testing
  activeCard: ActiveCard | null; // chance and community chest
  activeAuction: ActiveAuction | null; // unless gameStatus is auction
  activeBankruptcyAuction: ActiveBankruptcyAuction | null;
  // gameTimer: is not given a type since the server does not send this field over to the client
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
