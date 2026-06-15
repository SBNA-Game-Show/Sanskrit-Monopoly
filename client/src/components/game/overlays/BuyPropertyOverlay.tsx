import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";
import { socket } from "../../../socket";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";

type BuyPropertyOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
  uid: string | null;
};

export function BuyPropertyOverlay({
  gameState,
  isActivePlayer,
  uid,
}: BuyPropertyOverlayProps) {
  const action = gameState.pendingAction;

  if (!action || action.type !== "buyProperty") return null;

  const currentPlayer = gameState.players.find(
    (player) => player.uid === action.playerUid,
  );

  const handleBuyProperty = () => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_BUY_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  const handleDeclineProperty = () => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_DECLINE_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
        Property Available
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">
        {action.tileName}
      </h2>

      {isActivePlayer ? (
        <p className="mt-4 text-lg font-semibold text-[#6b3f1d]">
          You can buy this property for{" "}
          <span className="font-extrabold">₩{action.price}</span>.
        </p>
      ) : (
        <p className="mt-4 text-lg font-semibold text-[#6b3f1d]">
          Waiting for {currentPlayer?.username ?? "the current player"} to
          choose.
        </p>
      )}

      {isActivePlayer && !action.canAfford && (
        <p className="mt-3 rounded-2xl bg-[#fff4dc] px-4 py-3 text-sm font-bold text-[#b33a3a]">
          Not enough money to buy this property.
        </p>
      )}

      {isActivePlayer && (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleBuyProperty}
            disabled={!action.canAfford}
            className="rounded-full bg-[#e84a15] px-8 py-3 text-base font-extrabold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy
          </button>

          <button
            type="button"
            onClick={handleDeclineProperty}
            className="rounded-full bg-[#6b3f1d] px-8 py-3 text-base font-extrabold text-white shadow-md hover:bg-[#8a5428]"
          >
            Decline
          </button>
        </div>
      )}
    </GameOverlayShell>
  );
}
