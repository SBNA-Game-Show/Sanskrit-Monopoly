import { useMemo, useState } from "react";
import type { GameState, GameTile } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";
import { socket } from "../../../socket";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";

type BuyPropertyOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
  uid: string | null;
};

function formatMoney(amount: number) {
  return amount < 0 ? `-₩${Math.abs(amount)}` : `₩${amount}`;
}

function getTilePrice(tile: GameTile) {
  return tile.price ?? 100;
}

function getTileRent(tile: GameTile) {
  return tile.rent ?? Math.max(10, Math.round(getTilePrice(tile) * 0.1));
}

function getSellValue(tile: GameTile) {
  return Math.round(getTilePrice(tile) * 0.5);
}

function getPlayerOwnedTiles(gameState: GameState, propertyIds: string[]) {
  return propertyIds
    .map((propertyId) =>
      gameState.edition.tiles.find((tile) => tile.id === propertyId),
    )
    .filter((tile): tile is GameTile => Boolean(tile));
}

export function BuyPropertyOverlay({
  gameState,
  isActivePlayer,
  uid,
}: BuyPropertyOverlayProps) {
  const [showSellOptions, setShowSellOptions] = useState(false);
  const [selectedSellPropertyId, setSelectedSellPropertyId] = useState<
    string | null
  >(null);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const tileIndex = currentPlayer?.position ?? -1;
  const tile = gameState.edition.tiles[tileIndex];

  const owner = tile
    ? gameState.players.find((player) => player.properties.includes(tile.id))
    : null;

  const ownedTiles = useMemo(() => {
    if (!currentPlayer || !tile) return [];

    return getPlayerOwnedTiles(gameState, currentPlayer.properties).filter(
      (ownedTile) => ownedTile.id !== tile.id,
    );
  }, [currentPlayer, gameState, tile]);

  const selectedSellProperty =
    ownedTiles.find((ownedTile) => ownedTile.id === selectedSellPropertyId) ??
    ownedTiles[0] ??
    null;

  if (!currentPlayer || !tile || owner) return null;

  const price = getTilePrice(tile);
  const canAfford = currentPlayer.money >= price;
  const resolvedTileIndex = tileIndex >= 0 ? tileIndex : 0;
  const color = tile.color ?? "#ffffff";
  const description =
    tile.description ??
    "A Sanskrit Monopoly property card. Buy it to collect rent when other players land here.";

  const rent = getTileRent(tile);
  const rentWithSet = rent * 2;
  const sellValue = getSellValue(tile);

  const selectedSellValue = selectedSellProperty
    ? getSellValue(selectedSellProperty)
    : 0;

  const canSellAndAfford =
    Boolean(selectedSellProperty) &&
    currentPlayer.money + selectedSellValue >= price;

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

  const handleSellProperty = (propertyId: string) => {
    if (!gameState.lobbyCode || !uid || !isActivePlayer) return;

    socket.emit(GAME_EVENTS.GAME_SELL_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
      propertyId,
    });
  };

  const handleSellAndBuy = () => {
    if (!selectedSellProperty || !gameState.lobbyCode || !uid || !isActivePlayer) {
      return;
    }

    socket.emit(GAME_EVENTS.GAME_SELL_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
      propertyId: selectedSellProperty.id,
    });

    socket.emit(GAME_EVENTS.GAME_BUY_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  return (
    <GameOverlayShell>
      <div className="max-h-[82vh] overflow-y-auto rounded-[22px] border-[5px] border-[#6b3f1d] bg-[#fff4dc] text-[#160f08] shadow-inner">
        <div
          className="h-16 border-b-[5px] border-[#6b3f1d]"
          style={{ backgroundColor: color }}
        />

        <div className="p-6">
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

          <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-left text-sm font-semibold leading-relaxed text-[#6b3f1d]">
            {description}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
                Price
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {formatMoney(price)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
                Rent
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {formatMoney(rent)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">
                Sell
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {formatMoney(sellValue)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border-[4px] border-[#ffa23b] bg-white/70 p-4 text-left">
            <p className="text-sm font-extrabold uppercase text-[#6b3f1d]">
              Rent Rules
            </p>
            <p className="mt-2 text-sm font-semibold text-[#160f08]">
              Base rent is {formatMoney(rent)}. If the player owns the full
              color set, rent becomes {formatMoney(rentWithSet)}.
            </p>
          </div>

          <p className="mt-4 text-center text-lg font-extrabold text-[#160f08]">
            Your money: {formatMoney(currentPlayer.money ?? 0)}
          </p>

          <div className="mt-5">
            {isActivePlayer ? (
              <>
                {!canAfford && (
                  <div className="mb-4 rounded-2xl bg-[#fff1e5] px-4 py-3">
                    <p className="text-base font-extrabold text-[#b33a3a]">
                      Not enough money to buy this property.
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#6b3f1d]">
                      You need {formatMoney(price - currentPlayer.money)} more.
                      You can sell one of your properties below.
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

                {ownedTiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSellOptions((current) => !current)}
                    className="mt-4 h-[52px] w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] text-base font-extrabold text-[#6b3f1d] shadow-md hover:bg-white"
                  >
                    {showSellOptions
                      ? "Hide Properties to Sell"
                      : "View Properties to Sell"}
                  </button>
                )}
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

          {showSellOptions && ownedTiles.length > 0 && (
            <div className="mt-5 rounded-2xl border-[4px] border-[#ffa23b] bg-[#fff1e5] p-4">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
                Compare Properties Before Selling
              </p>

              <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
                Click a property to compare price, rent, and sell value.
              </p>

              <div className="mt-4 max-h-[170px] space-y-2 overflow-y-auto pr-1">
                {ownedTiles.map((ownedTile) => {
                  const isSelected =
                    selectedSellProperty?.id === ownedTile.id;

                  return (
                    <button
                      key={ownedTile.id}
                      type="button"
                      onClick={() => setSelectedSellPropertyId(ownedTile.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border-[4px] px-4 py-3 text-left font-bold shadow-sm ${
                        isSelected
                          ? "border-[#6b3f1d] bg-[#ffd7a3] text-[#160f08]"
                          : "border-[#ffa23b] bg-white/70 text-[#6b3f1d] hover:bg-[#ffd7a3]"
                      }`}
                    >
                      <span>{ownedTile.name}</span>
                      <span>{formatMoney(getSellValue(ownedTile))}</span>
                    </button>
                  );
                })}
              </div>

              {selectedSellProperty && (
                <div className="mt-4 rounded-2xl border-[4px] border-[#6b3f1d] bg-[#fffaf0] p-4 text-left">
                  <div
                    className="mb-4 h-9 rounded-xl border-[3px] border-[#6b3f1d]"
                    style={{
                      backgroundColor:
                        selectedSellProperty.color ?? "#ffffff",
                    }}
                  />

                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6b3f1d]">
                    Selected Property
                  </p>

                  <h3 className="mt-1 text-2xl font-extrabold text-[#160f08]">
                    {selectedSellProperty.name}
                  </h3>

                  <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-[#6b3f1d]">
                    {selectedSellProperty.description ??
                      "Review this property before deciding if you want to sell it."}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-[#f5bd78] px-2 py-3">
                      <p className="text-[11px] font-extrabold uppercase text-[#6b3f1d]">
                        Price
                      </p>
                      <p className="mt-1 text-lg font-extrabold">
                        {formatMoney(getTilePrice(selectedSellProperty))}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f5bd78] px-2 py-3">
                      <p className="text-[11px] font-extrabold uppercase text-[#6b3f1d]">
                        Rent
                      </p>
                      <p className="mt-1 text-lg font-extrabold">
                        {formatMoney(getTileRent(selectedSellProperty))}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f5bd78] px-2 py-3">
                      <p className="text-[11px] font-extrabold uppercase text-[#6b3f1d]">
                        Sell
                      </p>
                      <p className="mt-1 text-lg font-extrabold">
                        {formatMoney(getSellValue(selectedSellProperty))}
                      </p>
                    </div>
                  </div>

                  {!canAfford && (
                    <button
                      type="button"
                      disabled={!canSellAndAfford}
                      onClick={handleSellAndBuy}
                      className="mt-4 h-[50px] w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#e84a15] text-base font-extrabold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sell This & Buy New Property
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSellProperty(selectedSellProperty.id)}
                    className="mt-3 h-[50px] w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#b33a3a] text-base font-extrabold text-white shadow-md hover:bg-[#c84a4a]"
                  >
                    Sell Selected Property Only
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GameOverlayShell>
  );
}