import { useAuth } from "../../context/AuthContext";
import type { GameState } from "../../types/game/gameTypes";
import StartOfTurnOverlay from "./overlays/StartOfTurnOverlay";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";
import { MiniGameOverlay } from "./overlays/MiniGameOverlay";
import { DiceRollOverlay } from "./overlays/DiceRollOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
  isHost: boolean;
  onSubmitQuizAnswer: (optionId: string) => void;
};

function getCurrentPlayer(gameState: GameState) {
  return gameState.players[gameState.currentPlayerIndex];
}

// function getCurrentTile(gameState: GameState) {
//   const currentPlayer = getCurrentPlayer(gameState);

//   if (!currentPlayer) return undefined;

//   return gameState.edition.tiles[currentPlayer.position];
// }

export function GameOverlayLayer({ gameState, isHost, onSubmitQuizAnswer }: GameOverlayLayerProps) {
  const { uid } = useAuth();

  const currentPlayer = getCurrentPlayer(gameState);
  // const currentTile = getCurrentTile(gameState);

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
      return <DiceRollOverlay gameState={gameState} />;

    case "tokenAdvancing":
      // Do not render anything here, just move token across board
      return (
        <></>
      );

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
    case "communityChest":
      return (
        gameState.activeCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
            <div className="w-full max-w-[480px] rounded-3xl border-[8px] border-[#ffa23b] bg-[#fff4dc] p-7 text-center shadow-2xl">
              <h2 className="text-[38px] font-bold text-[#e84a15]">
                Community Chest
              </h2>

              <h3 className="mt-4 text-[26px] font-bold text-[#160f08]">
                {gameState.activeCard.title}
              </h3>

              <p className="mt-4 text-[20px] leading-relaxed text-[#6b3f1d]">
                {gameState.activeCard.message}
              </p>

              <p className="mt-5 text-[28px] font-bold text-[#e84a15]">
                {gameState.activeCard.points > 0 ? "+" : ""}
                {gameState.activeCard.points} points
              </p>
            </div>
          </div>
        )
      );

    case "miniGame":
      return <MiniGameOverlay />;

    default:
      return null;
  }
}