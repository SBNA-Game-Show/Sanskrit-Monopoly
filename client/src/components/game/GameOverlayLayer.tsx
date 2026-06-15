import { useAuth } from "../../context/AuthContext";
import { DEFAULT_BOARD_TILES } from "../../constants/zim/board";
import type { GameState } from "../../types/game/gameTypes";
import StartOfTurnOverlay from "./overlays/StartOfTurnOverlay";
import { PopQuizOverlay } from "./overlays/PopQuizOverlay";
import { VerseChallengeOverlay } from "./overlays/VerseChallengeOverlay";
import { PenaltyActivityOverlay } from "./overlays/PenaltyActivityOverlay";
import { MiniGameOverlay } from "./overlays/MiniGameOverlay";
import { DiceRollOverlay } from "./overlays/DiceRollOverlay";
import { PropertyTitleOverlay } from "./overlays/PropertyTitleOverlay";

type GameOverlayLayerProps = {
  gameState: GameState;
  isHost: boolean;
  onSubmitQuizAnswer: (optionId: string) => void;
  selectedPropertyId: string | null;
  selectedPropertyOwnerUid: string | null;
  ownedPropertyIds: string[];
  currentMoney: number;
  propertyOwnerName: string;
  onBuyProperty: (propertyId: string, price: number) => void;
  onDeclineProperty: () => void;
  onSellProperty: (propertyId: string, sellValue: number) => void;
  onClosePropertyOverlay: () => void;
};

function getCurrentPlayer(gameState: GameState) {
  return gameState.players[gameState.currentPlayerIndex];
}

function getCurrentTile(gameState: GameState) {
  const currentPlayer = getCurrentPlayer(gameState);

  if (!currentPlayer) return undefined;

  return gameState.edition.tiles[currentPlayer.position];
}

function isPropertyPosition(gameState: GameState) {
  const currentPlayer = getCurrentPlayer(gameState);

  if (!currentPlayer) return false;

  const currentTile = getCurrentTile(gameState);
  const boardTile =
    DEFAULT_BOARD_TILES[currentPlayer.position % DEFAULT_BOARD_TILES.length];

  return currentTile?.type === "property" || boardTile?.type === "property";
}

export function GameOverlayLayer({
  gameState,
  isHost,
  onSubmitQuizAnswer,
  selectedPropertyId,
  selectedPropertyOwnerUid,
  ownedPropertyIds,
  currentMoney,
  propertyOwnerName,
  onBuyProperty,
  onDeclineProperty,
  onSellProperty,
  onClosePropertyOverlay,
}: GameOverlayLayerProps) {
  const { uid } = useAuth();

  const currentPlayer = getCurrentPlayer(gameState);

  if (!currentPlayer || !gameState.gameStatus) return null;

  const isActivePlayer = currentPlayer.uid === uid;
  const isViewingCurrentPlayersProperty =
    !selectedPropertyOwnerUid || selectedPropertyOwnerUid === currentPlayer.uid;

  if (
    selectedPropertyId ||
    (gameState.gameStatus === "turnEnded" && isPropertyPosition(gameState))
  ) {
    return (
      <PropertyTitleOverlay
        gameState={gameState}
        isActivePlayer={isActivePlayer}
        selectedPropertyId={selectedPropertyId}
        ownedPropertyIds={ownedPropertyIds}
        currentMoney={currentMoney}
        propertyOwnerName={propertyOwnerName}
        canManageProperty={isActivePlayer && isViewingCurrentPlayersProperty}
        onBuyProperty={onBuyProperty}
        onDeclineProperty={onDeclineProperty}
        onSellProperty={onSellProperty}
        onClose={onClosePropertyOverlay}
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
      return null;

    case "popQuiz":
      return (
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

    case "miniGame":
      return <MiniGameOverlay />;

    default:
      return null;
  }
}
