import type { PlayerState } from "../../game/gameTypes";

export type ZimBoardState = {
  players: PlayerState[];
  currentTurnUid: string | null;
};

export type ZimBoardController = {
  update: (state: ZimBoardState) => void;
  dispose: () => void;
};

export type ZimMonopolyBoardProps = ZimBoardState;
