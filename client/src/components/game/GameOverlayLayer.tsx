import type { GameState } from "../../types/game/gameTypes";
import StartOfTurnOverlay from "./overlays/StartOfTurnOverlay";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";
import { MiniGameOverlay } from "./overlays/MiniGameOverlay";
import { DiceRollOverlay } from "./overlays/DiceRollOverlay";
import { BuyPropertyOverlay } from "./overlays/BuyPropertyOverlay";
import { BankruptcyOverlay } from "./overlays/BankruptcyOverlay";
import { JailOverlay } from "./overlays/JailOverlay";
import { ChanceOverlay } from "./overlays/ChanceOverlay";
import { CommunityChestOverlay } from "./overlays/CommunityChestOverlay";
import { BankruptcyAuctionOverlay } from "./overlays/BankruptcyAuctionOverlay";
import { AuctionOverlay } from "./overlays/AuctionOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
  uid: string | null;
  isHost: boolean;
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
  uid,
}: GameOverlayLayerProps) {
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

    case "bankruptcy":
      return (
        <BankruptcyOverlay gameState={gameState} isHost={isHost} uid={uid} />
      );

    case "buyProperty":
      return (
        <BuyPropertyOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
          uid={uid}
        />
      );

    case "jail":
      return (
        <JailOverlay gameState={gameState} isActivePlayer={isActivePlayer} />
      );

    case "rollingDice":
      return <DiceRollOverlay gameState={gameState} />;

    case "tokenAdvancing":
      // Do not render anything here, just move token across board
      return <></>;

    case "chance":
      return (
        <ChanceOverlay gameState={gameState} isActivePlayer={isActivePlayer} />
      );

    case "community":
      return (
        <CommunityChestOverlay
          gameState={gameState}
          isActivePlayer={isActivePlayer}
        />
      );

    // auction overlay added to the mix
    case "auction":
      return <AuctionOverlay gameState={gameState} uid={uid} isHost={isHost} />;

    case "bankruptcyAuction":
      return (
        <BankruptcyAuctionOverlay
          gameState={gameState}
          uid={uid}
          isHost={isHost}
        />
      );

    case "popQuiz":
      return (
        //activeQuiz must not be null
        gameState.activeQuiz && (
          <PopQuizOverlay
            gameState={gameState}
            quiz={gameState.activeQuiz}
            isHost={isHost}
            lobbyCode={gameState.lobbyCode}
            uid={uid}
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
        //intentionally render nothing
        //maybe remove this case entirely later and double check if it breaks anything
        <></>
      );

    case "miniGame":
      return <MiniGameOverlay />;

    default:
      return null;
  }
}
