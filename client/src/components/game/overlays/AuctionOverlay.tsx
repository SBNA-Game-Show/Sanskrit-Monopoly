import type { GameState, PlayerState } from "../../../types/game/gameTypes";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";
import { socket } from "../../../socket";
import { PropertySummaryCard } from "../PropertySummaryCard";
import { GameOverlayShell } from "./GameOverlayShell";
import { formatMoney } from "../../../utils/gameMoney";

type AuctionOverlayProps = {
  gameState: GameState;
  uid: string | null;
  isHost: boolean;
};

const BID_INCREMENTS = [1, 5, 10, 25];

function getBidStatus(
  player: PlayerState,
  highestBidderUid: string | null,
  nextMinimumBid: number,
) {
  if (player.isEliminated) return "Eliminated";
  if (player.isBankrupt) return "Bankrupt";
  if (player.uid === highestBidderUid) return "Leading";
  if (player.money < nextMinimumBid) return "Not enough money";
  return "Can bid";
}

function getBidStatusClass(status: string) {
  if (status === "Leading") return "bg-[#e84a15] text-white";
  if (status === "Can bid") return "bg-[#5CB85C] text-white";
  if (status === "Not enough money") return "bg-[#fff1e5] text-[#b33a3a]";
  return "bg-[#7a5c42] text-white";
}

function getCurrentAuctionLogs(gameState: GameState, tileName: string) {
  let startIndex = -1;

  // Scope activity to the current auction so older property bids do not leak in.
  for (let index = gameState.log.length - 1; index >= 0; index -= 1) {
    const message = gameState.log[index].message;
    const startsCurrentAuction =
      message.includes(tileName) &&
      (message.includes("Auction started") ||
        message.includes("bankruptcy auction"));

    if (startsCurrentAuction) {
      startIndex = index;
      break;
    }
  }

  const scopedLogs = startIndex >= 0 ? gameState.log.slice(startIndex) : [];

  return scopedLogs
    .filter((log) => {
      const message = log.message;

      return (
        message.includes("raised the auction") ||
        (message.includes(tileName) &&
          (message.includes("Auction started") ||
            message.includes("bankruptcy auction") ||
            message.includes("won") ||
            message.includes("received no auction bids")))
      );
    })
    .slice(-4);
}

export function AuctionOverlay({
  gameState,
  uid,
  isHost,
}: AuctionOverlayProps) {
  const auction = gameState.activeAuction;

  // Render nothing instead of crashing if the server clears auction state mid-render.
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

  const isBankruptcyAuction = auction.source === "bankruptcy";
  const isHighestBidder = auction.highestBidderUid === uid;
  const nextMinimumBid = auction.highestBid + 1;

  const recentAuctionLogs = getCurrentAuctionLogs(gameState, tile.name);

  function handlePlaceBid(increment: number) {
    if (!gameState.lobbyCode || !uid) return;

    // The server adds this increment to the latest auction bid.
    socket.emit(GAME_EVENTS.GAME_PLACE_AUCTION_BID, {
      lobbyCode: gameState.lobbyCode,
      uid,
      bidIncrement: increment,
    });
  }

  function handleResolveAuction() {
    if (!gameState.lobbyCode || !uid || !isHost) return;

    // Host-controlled resolution keeps auction timing simple and table-managed.
    socket.emit(GAME_EVENTS.GAME_RESOLVE_AUCTION, {
      lobbyCode: gameState.lobbyCode,
      hostUid: uid,
    });
  }

  return (
    <GameOverlayShell size="wide">
      <div className="max-h-[82vh] overflow-y-auto text-[#160f08]">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
          {isBankruptcyAuction ? "Bankruptcy Auction" : "Auction"}
        </p>
        <h2 className="mt-1 text-[32px] font-extrabold leading-tight">
          {tile.name}
        </h2>
        <div className="mt-5 rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] p-5 shadow-inner">
          <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
            Current Bid
          </p>

          <p className="mt-1 text-[42px] font-extrabold leading-none text-[#e84a15]">
            {formatMoney(auction.highestBid)}
          </p>

          <p className="mt-2 text-sm font-bold text-[#6b3f1d]">
            {highestBidder
              ? `Leading bidder: ${highestBidder.username}`
              : "No bids yet."}
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_488px] lg:items-start">
          <div className="rounded-2xl border-[4px] border-[#ffa23b] bg-[#fff1e5] p-4 text-left">
            <p className="text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
              Bidders
            </p>

            <div className="mt-3 space-y-2">
              {gameState.players.map((player) => {
                const status = getBidStatus(
                  player,
                  auction.highestBidderUid,
                  nextMinimumBid,
                );

                return (
                  <div
                    key={player.uid}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2"
                  >
                    <div>
                      <p className="font-extrabold text-[#160f08]">
                        {player.username}
                      </p>

                      <p className="text-xs font-bold text-[#6b3f1d]">
                        {formatMoney(player.money)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${getBidStatusClass(
                        status,
                      )}`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>

            {recentAuctionLogs.length > 0 && (
              <div className="mt-4 rounded-xl bg-white/60 px-3 py-3">
                <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
                  Auction Activity
                </p>

                <div className="mt-2 space-y-1">
                  {recentAuctionLogs.map((log) => (
                    <p
                      key={log.id}
                      className="text-xs font-semibold text-[#6b3f1d]"
                    >
                      {log.username}: {log.message}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <PropertySummaryCard
            tile={tile}
            label={
              isBankruptcyAuction ? "Bankruptcy Property" : "Auction Property"
            }
          />
        </div>
        {!isHost && currentPlayer && (
          <div className="mt-5">
            <div className="grid grid-cols-4 gap-3">
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
                    +{formatMoney(increment)}
                  </button>
                );
              })}
            </div>

            {isHighestBidder && (
              <p className="mt-3 text-sm font-semibold text-[#6b3f1d]">
                You are leading. Waiting for another player to raise or for the
                host to resolve.
              </p>
            )}

            {currentPlayer.money < nextMinimumBid && (
              <p className="mt-3 text-sm font-semibold text-[#b33a3a]">
                You do not have enough money to raise the bid.
              </p>
            )}
          </div>
        )}
        {isHost && (
          <button
            type="button"
            onClick={handleResolveAuction}
            className="mt-5 h-[54px] w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#6b3f1d] text-base font-extrabold text-white shadow-md hover:bg-[#8a5427]"
          >
            Resolve Auction
          </button>
        )}
      </div>
    </GameOverlayShell>
  );
}
