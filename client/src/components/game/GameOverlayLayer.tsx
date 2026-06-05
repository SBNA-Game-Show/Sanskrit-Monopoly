import type { GameState } from "../../types/game/gameTypes";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
};

export function GameOverlayLayer({ gameState }: GameOverlayLayerProps) {
  switch (gameState.gameStatus) {
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
