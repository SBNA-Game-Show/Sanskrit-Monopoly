import type { GameState } from "../../types/game/gameTypes";
import StartOfTurnOverlay from "./overlays/StartOfTurnOverlay";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";
import { MiniGameOverlay } from "./overlays/MiniGameOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
  isHost: boolean;
  onSubmitQuizAnswer: (optionId: string) => void;
};

export function GameOverlayLayer({
  gameState,
  onSubmitQuizAnswer,
  isHost,
}: GameOverlayLayerProps) {
  switch (gameState.gameStatus) {
    case "startOfTurn":
      return <StartOfTurnOverlay gameState={gameState} />;

    case "popQuiz":
      if (!gameState.activeQuiz) return null;

      return (
        <PopQuizOverlay
          quiz={gameState.activeQuiz}
          players={gameState.players}
          isHost={isHost}
          onSubmitAnswer={onSubmitQuizAnswer}
        />
      );

    case "verseChallenge":
      return <VerseChallengeOverlay />;

    case "penaltyActivity":
      return <PenaltyActivityOverlay />;

    case "miniGame":
      return <MiniGameOverlay />;

    default:
      return null;
  }
}
