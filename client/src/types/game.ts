export type LobbyPlayer = {
  uid?: string | null;
  username?: string | null;
  socketId?: string | null;
};

export type LobbyHost = {
  uid?: string | null;
  username?: string | null;
  socketId?: string | null;
};

export type GamePlayer = {
  id: number;
  uid?: string | null;
  username: string;
  socketId?: string | null;
  money: number;
  score: number;
  position: number;
  status: string;
  token: string;
  properties: number;
};

export type MonopolyGame = {
  selectedEdition: string;
  startingMoney: number;
  players: GamePlayer[];
  currentPlayerIndex: number;
  diceResult: number | null;
  tileLanded: string;
  lastAction: string;
  lastEffect: "reward" | "penalty" | "safe" | "start";
  turnNumber: number;
};

export type LobbyState = {
  lobbyCode: string;
  status: "waiting" | "playing" | "ended";
  players: LobbyPlayer[];
  host: LobbyHost;
  game?: MonopolyGame;
};
