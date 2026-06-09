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

  switch (gameState.gameStatus) {
    case "startOfTurn":
      return (
        <StartOfTurnOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    case "rollingDice":
      return (
        // Change this to its own seperate dice roll overlay later
        <StartOfTurnOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
          mode="rollingDice"
        />
      );

    case "tokenAdvancing":
      // Do not render anything here, just move token across board
      return (
        <></>
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
        // This is named "penaltyActivity" but it's a word matching game
        // rename to something like "wordMatch" later
        <PenaltyActivityOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    case "turnEnded":
      return (
        // Change this to its own seperate result overlay later
        // ex: player 1 got +20 points or -20 points, etc
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