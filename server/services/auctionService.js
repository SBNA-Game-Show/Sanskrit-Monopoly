import { getLobby, addLog } from "./lobbyService.js";

// set amount of money that can be bid
const AUCTION_BID_INCREMENTS = [1, 5, 10, 25];

// helper function for auctioning
export function createActiveAuction(tile) {
  return {
    tileId: tile.id,
    highestBid: 0,
    highestBidderUid: null,
  };
}

export function getEligibleAuctionBidders(lobby, minimumBid = 1) {
  // only real active players with enough money count as auction competitors
  return lobby.players.filter(
    (player) =>
      !player.isEliminated && !player.isBankrupt && player.money >= minimumBid,
  );
}

// function that dictates how placing bids in an auction works
export function placeAuctionBid(lobbyCode, uid, bidIncrement) {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return { lobby: null, error: "Lobby not found" };

  // only accept bids during an active auction
  if (lobby.gameStatus !== "auction" || !lobby.activeAuction) {
    return { lobby, error: "No auction is active" };
  }

  const player = lobby.players.find(
    (currentPlayer) => currentPlayer.uid === uid,
  );

  // block bankrupt/eliminated players from auctioning
  if (!player || player.isEliminated || player.isBankrupt) {
    return { lobby, error: "Player not found" };
  }

  // incremental bidding so it's easier to click
  const increment = Number(bidIncrement);

  // only allow the fixed Monopoly-style bid buttons
  if (!AUCTION_BID_INCREMENTS.includes(increment)) {
    return { lobby, error: "Invalid bid increment" };
  }

  // avoid players accidentally bidding against themself
  if (lobby.activeAuction.highestBidderUid === uid) {
    return { lobby, error: "You are already the highest bidder" };
  }

  // new bid is current highest bid plus clicked increment
  const bid = lobby.activeAuction.highestBid + increment;

  // prevent player from bidding higher than amount of money they have
  if (player.money < bid) {
    return { lobby, error: "Not enough money for that bid" };
  }

  lobby.activeAuction.highestBid = bid;
  lobby.activeAuction.highestBidderUid = uid;

  addLog(lobby.lobbyCode, {
    uid,
    username: player.username,
    message: `bid ₩${bid} in the auction.`,
  });

  return { lobby, error: null };
}

// function that dictates what to do when an auction ends
export function resolveAuction(lobbyCode, hostUid) {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return { lobby: null, error: "Lobby not found" };

  // Host resolves auction manually (for now)
  if (lobby.host.uid !== hostUid) {
    return { lobby, error: "Only the host can resolve auctions" };
  }

  // check if an auction is currently active
  if (lobby.gameStatus !== "auction" || !lobby.activeAuction) {
    return { lobby, error: "No auction is active" };
  }

  const auction = lobby.activeAuction;
  const tile = lobby.edition.tiles.find(
    (currentTile) => currentTile.id === auction.tileId,
  );

  if (!tile) return { lobby, error: "Auction tile not found" };

  const winner = auction.highestBidderUid
    ? lobby.players.find((player) => player.uid === auction.highestBidderUid)
    : null;

  if (winner) {
    // defensive check in case winner's money changed after bidding
    if (winner.money < auction.highestBid) {
      return { lobby, error: "Winning bidder can no longer afford the bid" };
    }

    // winner pays their bid then receives auctioned property
    winner.money -= auction.highestBid;
    winner.properties.push(tile.id);

    // current rules prevent this from being true (overbidding is blocked... for now)
    winner.isBankrupt = winner.money < 0;

    addLog(lobby.lobbyCode, {
      uid: winner.uid,
      username: winner.username,
      message: `won ${tile.name} at auction for ₩${auction.highestBid}.`,
    });
  } else {
    addLog(lobby.lobbyCode, {
      uid: lobby.host.uid,
      username: lobby.host.username,
      message: `${tile.name} received no auction bids.`,
    });
  }

  lobby.activeAuction = null;
  lobby.gameStatus = "turnEnded";

  return { lobby, error: null };
}
