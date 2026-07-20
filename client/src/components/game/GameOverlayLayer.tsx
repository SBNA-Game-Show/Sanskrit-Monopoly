import { useEffect, useRef, useState } from "react";
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
import { TileRevealOverlay } from "./overlays/TileRevealOverlay";

const TILE_STATUSES = new Set([
  "jail",
  "buyProperty",
  "chance",
  "community",
  "popQuiz",
  "verseChallenge",
  "penaltyActivity",
  "miniGame",
]);

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
  const [phase, setPhase] = useState<"pre" | "overlay">("overlay"); //this is used to show the tile reveal animation before the actual overlay
  const prevStatus = useRef(gameState.gameStatus);
 
  useEffect(() => { 
    if (gameState.gameStatus === prevStatus.current) return;
    prevStatus.current = gameState.gameStatus;
 
    if (TILE_STATUSES.has(gameState.gameStatus)) {
      setPhase("pre"); // Show the tile reveal animation before the actual overlay
    } else {
      setPhase("overlay"); // Show the actual overlay immediately for non-tile statuses like rolling the dice
    }
  }, [gameState.gameStatus]);

  const currentPlayer = getCurrentPlayer(gameState);
  // const currentTile = getCurrentTile(gameState);

  if (!currentPlayer || !gameState.gameStatus) return null;

  const isActivePlayer = currentPlayer.uid === uid;

  if (phase === "pre" && TILE_STATUSES.has(gameState.gameStatus)) {
    return <TileRevealOverlay onComplete={() => setPhase("overlay")} />;
  }

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
        <></>
        // commented out for now
        // Change this to its own seperate result overlay later
        // ex: player 1 got +20 points or -20 points, etc
        // <PenaltyActivityOverlay
        //   gameState={gameState}
        //   isActivePlayer={isActivePlayer}
        //   mode="result"
        // />
      );

    case "miniGame":
      return <MiniGameOverlay />;

    default:
      return null;
  }
}
