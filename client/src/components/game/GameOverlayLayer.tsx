import type { GameState } from "../../types/game/gameTypes";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";
import StartOfTurnOverlay from "./overlays/StartOfTurnOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
};

export function GameOverlayLayer({ gameState }: GameOverlayLayerProps) {
  switch (gameState.gameStatus) {
    case "startOfTurn":
      return <StartOfTurnOverlay gameState={gameState} />;
      
    case "popQuiz":
      return <PopQuizOverlay players={gameState.players} />;

    case "verseChallenge":
      return <VerseChallengeOverlay />;

    case "penaltyActivity":
      return <PenaltyActivityOverlay />;

    default:
      return null;
  }
}
