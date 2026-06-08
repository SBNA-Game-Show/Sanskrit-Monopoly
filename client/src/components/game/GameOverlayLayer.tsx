import { useAuth } from "../../context/AuthContext";
import type { GameState } from "../../types/game/gameTypes";
import StartOfTurnOverlay from "./overlays/StartOfTurnOverlay";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
};

function getCurrentPlayer(gameState: GameState) {
  return gameState.players[gameState.currentPlayerIndex];
}

function getCurrentTile(gameState: GameState) {
  const currentPlayer = getCurrentPlayer(gameState);

  if (!currentPlayer) return undefined;

  return gameState.edition.tiles[currentPlayer.position];
}

export function GameOverlayLayer({ gameState }: GameOverlayLayerProps) {
  const { uid } = useAuth();

  const currentPlayer = getCurrentPlayer(gameState);
  const currentTile = getCurrentTile(gameState);

  if (!currentPlayer || !gameState.gameStatus) return null;

  const isActivePlayer = currentPlayer.uid === uid;

  const overlayStatus =
    gameState.gameStatus === "turnEnded" && currentTile?.type === "penalty"
      ? "popQuiz"
      : String(gameState.gameStatus);

  switch (overlayStatus) {
    case "startOfTurn":
      return (
        <StartOfTurnOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    case "rollingDice":
      return (
        <StartOfTurnOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
          mode="rollingDice"
        />
      );

    case "tokenAdvancing":
      return (
        <StartOfTurnOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
          mode="tokenAdvancing"
        />
      );

    case "popQuiz":
      return (
        <PopQuizOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    case "verseChallenge":
      return (
        <VerseChallengeOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    case "penaltyActivity":
      return (
        <PenaltyActivityOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    case "turnEnded":
      return (
        <PenaltyActivityOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
          mode="result"
        />
      );

    default:
      return null;
  }
}