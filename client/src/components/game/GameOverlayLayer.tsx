import { useAuth } from "../../context/AuthContext";
import type { GameState } from "../../types/game/gameTypes";
import StartOfTurnOverlay from "./overlays/StartOfTurnOverlay";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";
import { MiniGameOverlay } from "./overlays/MiniGameOverlay";
import { DiceRollOverlay } from "./overlays/DiceRollOverlay";
import { BuyPropertyOverlay } from "./overlays/BuyPropertyOverlay";
import { BankruptcyOverlay } from "./overlays/BankruptcyOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
  isHost: boolean;
  onSubmitQuizAnswer: (optionId: string) => void;
  onBuyProperty: () => void;
  onDeclineProperty: () => void;
  onResolveBankruptcy: (bankruptPlayerUid: string) => void;
};

function getCurrentPlayer(gameState: GameState) {
  return gameState.players[gameState.currentPlayerIndex];
}

// function getCurrentTile(gameState: GameState) {
//   const currentPlayer = getCurrentPlayer(gameState);

//   if (!currentPlayer) return undefined;

//   return gameState.edition.tiles[currentPlayer.position];
// }

export function GameOverlayLayer({
  gameState,
  isHost,
  onSubmitQuizAnswer,
  onBuyProperty,
  onDeclineProperty,
  onResolveBankruptcy,
}: GameOverlayLayerProps) {
  const { uid } = useAuth();

  const currentPlayer = getCurrentPlayer(gameState);
  // const currentTile = getCurrentTile(gameState);

  if (!currentPlayer || !gameState.gameStatus) return null;

  const isActivePlayer = currentPlayer.uid === uid;

  // check if pending action is currently "bankruptcy"
  if (gameState.pendingAction?.type === "bankruptcy") {
    return (
      <BankruptcyOverlay
        gameState={gameState}
        isHost={isHost}
        onResolveBankruptcy={onResolveBankruptcy}
      />
    );
  }

  // check if pending action is currently "buyProperty"
  if (gameState.pendingAction?.type === "buyProperty") {
    return (
      <BuyPropertyOverlay
        gameState={gameState}
        isActivePlayer={gameState.pendingAction.playerUid === uid}
        onBuyProperty={onBuyProperty}
        onDeclineProperty={onDeclineProperty}
      />
    );
  }

  switch (gameState.gameStatus) {
    case "startOfTurn":
      return (
        <StartOfTurnOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    case "rollingDice":
      return <DiceRollOverlay gameState={gameState} />;

    case "tokenAdvancing":
      // Do not render anything here, just move token across board
      return <></>;

    case "popQuiz":
      return (
        //activeQuiz must not be null
        gameState.activeQuiz && (
          <PopQuizOverlay
            quiz={gameState.activeQuiz}
            players={gameState.players}
            isHost={isHost}
            onSubmitAnswer={onSubmitQuizAnswer}
          />
        )
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

    case "miniGame":
      return <MiniGameOverlay />;

    default:
      return null;
  }
}
