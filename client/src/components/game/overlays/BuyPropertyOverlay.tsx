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
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const tileIndex = currentPlayer?.position ?? -1;
  const tile = gameState.edition.tiles[tileIndex];

  const owner = tile
    ? gameState.players.find((player) => player.properties.includes(tile.id))
    : null;

  if (!currentPlayer || !tile || owner) return null;

  const price = tile.price ?? 100;
  const canAfford = currentPlayer.money >= price;
  const resolvedTileIndex = tileIndex >= 0 ? tileIndex : 0;
  const boardTile =
    gameState.edition.tiles[resolvedTileIndex % gameState.edition.tiles.length];
  const editionTile = gameState.edition.tiles[resolvedTileIndex];

  const color = boardTile?.color ?? "#7b1e2b";
  const description =
    editionTile?.description ??
    "A Sanskrit Monopoly property card. Buy it to collect rent when other players land here.";
  const rent = 10; // make dynamic later
  const rentWithSet = rent * 2;
  const sellValue = Math.round(price * 0.5);

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
      <div className="max-h-[82vh] overflow-y-auto rounded-[22px] border-[5px] border-[#6b3f1d] bg-[#fff4dc] text-[#160f08] shadow-inner">
        {/* Color banner */}
        <div
          className="h-16 border-b-[5px] border-[#6b3f1d]"
          style={{ backgroundColor: color }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="text-left">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6b3f1d]">
              Property Title Card
            </p>
            <h2 className="mt-2 text-[34px] font-extrabold leading-tight text-[#160f08]">
              {tile.name}
            </h2>
            <p className="mt-1 text-sm font-bold text-[#6b3f1d]">
              Position {resolvedTileIndex} • Unowned
            </p>
          </div>

          {/* Description */}
          <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-left text-sm font-semibold leading-relaxed text-[#6b3f1d]">
            {description}
          </p>

          {/* Stats grid */}
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
                Price
              </p>
              <p className="mt-1 text-2xl font-extrabold">₩{price}</p>
            </div>
            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
                Rent
              </p>
              <p className="mt-1 text-2xl font-extrabold">₩{rent}</p>
            </div>
            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
                Sell
              </p>
              <p className="mt-1 text-2xl font-extrabold">₩{sellValue}</p>
            </div>
          </div>

          {/* Rent rules */}
          <div className="mt-5 rounded-2xl border-[4px] border-[#ffa23b] bg-white/70 p-4 text-left">
            <p className="text-sm font-extrabold uppercase text-[#6b3f1d]">
              Rent Rules
            </p>
            <p className="mt-2 text-sm font-semibold text-[#160f08]">
              Base rent is ₩{rent}. If the player owns the full color set, rent
              becomes ₩{rentWithSet}.
            </p>
          </div>

          {/* Affordability / actions */}
          <div className="mt-5">
            {isActivePlayer ? (
              <>
                {!canAfford && (
                  <div className="mb-4 rounded-2xl bg-[#fff1e5] px-4 py-3">
                    <p className="text-base font-extrabold text-[#b33a3a]">
                      Not enough money to buy this property.
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBuyProperty}
                    disabled={!canAfford}
                    className="h-[54px] flex-1 rounded-2xl border-[5px] border-[#ffa23b] bg-[#e84a15] text-lg font-extrabold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Buy Property
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineProperty}
                    className="h-[54px] flex-1 rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] text-lg font-extrabold text-[#6b3f1d] shadow-md hover:bg-white"
                  >
                    Do Not Buy
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-[#fff1e5] p-4 text-center">
                <p className="text-lg font-semibold text-[#6b3f1d]">
                  Waiting for{" "}
                  <span className="font-extrabold">
                    {currentPlayer?.username ?? "the current player"}
                  </span>{" "}
                  to decide.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameOverlayShell>
  );
}
