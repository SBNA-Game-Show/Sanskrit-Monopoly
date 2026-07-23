import type { GameState, GameTile } from "../../../types/game/gameTypes";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";
import { socket } from "../../../socket";
import { GameOverlayShell } from "./GameOverlayShell";
import { formatMoney } from "../../../utils/gameMoney";

type BankruptcyAuctionOverlayProps = {
  gameState: GameState;
  uid: string | null;
  isHost: boolean;
};

export function BankruptcyAuctionOverlay({
  gameState,
  uid,
  isHost,
}: BankruptcyAuctionOverlayProps) {
  const pool = gameState.activeBankruptcyAuction;
  if (!pool) return null;

  const properties = pool.propertyIds
    .map((propertyId) =>
      gameState.edition.tiles.find((tile) => tile.id === propertyId),
    )
    .filter((tile): tile is GameTile => Boolean(tile));

  function handleStartAuction(propertyId: string) {
    if (!gameState.lobbyCode || !uid || !isHost) return;

    // Host chooses which bankrupt property becomes the next live auction.
    socket.emit(GAME_EVENTS.GAME_START_BANKRUPTCY_AUCTION, {
      lobbyCode: gameState.lobbyCode,
      hostUid: uid,
      propertyId,
    });
  }

  function handleClearProperty(propertyId: string) {
    if (!gameState.lobbyCode || !uid || !isHost) return;

    // Clearing removes one unwanted bankrupt property without auctioning it.
    socket.emit(GAME_EVENTS.GAME_CLEAR_BANKRUPTCY_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      hostUid: uid,
      propertyId,
    });
  }

  function handleClearAll() {
    if (!gameState.lobbyCode || !uid || !isHost) return;

    // Clearing all ends the bankruptcy auction pool immediately.
    socket.emit(GAME_EVENTS.GAME_CLEAR_BANKRUPTCY_AUCTIONS, {
      lobbyCode: gameState.lobbyCode,
      hostUid: uid,
    });
  }

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
        Bankruptcy Auction
      </p>

      <h2 className="text-[30px] font-extrabold text-[#160f08]">
        {pool.bankruptPlayerName}'s Properties
      </h2>

      <p className="mt-3 text-sm font-bold text-[#6b3f1d]">
        {isHost
          ? "Choose a property to auction, or clear properties nobody wants."
          : "Waiting for the host to choose the next bankruptcy auction."}
      </p>

      {isHost && properties.length > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="mt-5 rounded-full bg-[#6b3f1d] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#8a5427]"
        >
          Clear All
        </button>
      )}

      <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1 text-left">
        {properties.map((property) => (
          <div
            key={property.id}
            className="rounded-2xl border-[4px] border-[#ffa23b] bg-[#fff4dc] p-4 shadow-inner"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-extrabold text-[#160f08]">
                  {property.name}
                </p>
                <p className="mt-1 text-sm font-bold text-[#6b3f1d]">
                  Price: {formatMoney(property.price)} • Rent: {formatMoney(property.rent)}
                </p>
              </div>

              {isHost && (
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartAuction(property.id)}
                    className="rounded-xl bg-[#e84a15] px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-[#ff7a2f]"
                  >
                    Auction
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearProperty(property.id)}
                    className="rounded-xl bg-[#b33a3a] px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-[#c84a4a]"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </GameOverlayShell>
  );
}