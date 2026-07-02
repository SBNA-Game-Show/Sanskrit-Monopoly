import type { GameState } from "../../../types/game/gameTypes";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";
import { socket } from "../../../socket";
import { GameOverlayShell } from "./GameOverlayShell";

type AuctionOverlayProps = {
  gameState: GameState;
  uid: string | null;
  isHost: boolean;
};

export function AuctionOverlay({
  gameState,
  uid,
  isHost,
}: AuctionOverlayProps) {
  const auction = gameState.activeAuction;

  // render nothing instead of crashing the overlay
  if (!auction) return null;

  const tile = gameState.edition.tiles.find(
    (currentTile) => currentTile.id === auction.tileId,
  );

  if (!tile) return null;

  const currentPlayer = gameState.players.find((player) => player.uid === uid);
  const highestBidder = auction.highestBidderUid
    ? gameState.players.find(
        (player) => player.uid === auction.highestBidderUid,
      )
    : null;

  const isHighestBidder = auction.highestBidderUid === uid;

  const BID_INCREMENTS = [1, 5, 10, 25];

  function handlePlaceBid(increment: number) {
    if (!gameState.lobbyCode || !uid) return;

    // Send bid to server
    socket.emit(GAME_EVENTS.GAME_PLACE_AUCTION_BID, {
      lobbyCode: gameState.lobbyCode,
      uid,
      bidIncrement: increment,
    });
  }

  function handleResolveAuction() {
    if (!gameState.lobbyCode || !uid || !isHost) return;

    // resolved by host for now
    // avoids timers or passing a bid
    socket.emit(GAME_EVENTS.GAME_RESOLVE_AUCTION, {
      lobbyCode: gameState.lobbyCode,
      hostUid: uid,
    });
  }

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
        Auction
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">{tile.name}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#fff4dc] p-4 shadow-inner">
          <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
            Original Value
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#160f08]">
            ₩{tile.price ?? 100}
          </p>
        </div>

        <div className="rounded-2xl bg-[#fff4dc] p-4 shadow-inner">
          <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
            Highest Bid
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#160f08]">
            ₩{auction.highestBid}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[#fff4dc] p-5 text-center shadow-inner">
        <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
          {highestBidder
            ? `Leading bidder: ${highestBidder.username}`
            : "No bids yet."}
        </p>
      </div>

      {/* grey out buttons if can't be used */}
      {!isHost && currentPlayer && (
        <div className="mt-5 grid grid-cols-4 gap-3">
          {BID_INCREMENTS.map((increment) => {
            const nextBid = auction.highestBid + increment;
            const canRaise =
              !currentPlayer.isEliminated &&
              !currentPlayer.isBankrupt &&
              !isHighestBidder &&
              currentPlayer.money >= nextBid;

            return (
              <button
                key={increment}
                type="button"
                disabled={!canRaise}
                onClick={() => handlePlaceBid(increment)}
                className="h-[54px] rounded-2xl border-[5px] border-[#ffa23b] bg-[#e84a15] text-lg font-extrabold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                +₩{increment}
              </button>
            );
          })}
        </div>
      )}

      {/* show message if a player doesn't have enough money to bid */}
      {!isHost &&
        currentPlayer &&
        currentPlayer.money < auction.highestBid + 1 && (
          <p className="mt-5 text-sm font-semibold text-[#b33a3a]">
            You do not have enough money to raise the bid.
          </p>
        )}

      {isHost && (
        <button
          type="button"
          onClick={handleResolveAuction}
          className="mt-6 rounded-full bg-[#6b3f1d] px-8 py-3 text-base font-extrabold text-white shadow-md hover:bg-[#8a5427]"
        >
          Resolve Auction
        </button>
      )}

      {!isHost && currentPlayer && isHighestBidder && (
        <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
          Waiting for another player to raise or for the host to resolve.
        </p>
      )}
    </GameOverlayShell>
  );
}
