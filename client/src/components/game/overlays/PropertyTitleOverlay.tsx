import { useMemo, useState } from "react";
import { DEFAULT_BOARD_TILES } from "../../../constants/zim/board";
import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";

type PropertyTitleOverlayProps = {
  gameState: GameState;
  isActivePlayer: boolean;
  selectedPropertyId: string | null;
  ownedPropertyIds: string[];
  currentMoney: number;
  propertyOwnerName: string;
  canManageProperty: boolean;
  onBuyProperty: (propertyId: string, price: number) => void;
  onDeclineProperty: () => void;
  onSellProperty: (propertyId: string, sellValue: number) => void;
  onClose: () => void;
};

type PropertyDetails = {
  id: string;
  name: string;
  color: string;
  description: string;
  price: number;
  rent: number;
  rentWithSet: number;
  sellValue: number;
  tileIndex: number;
};

function getCurrentPlayer(gameState: GameState) {
  return gameState.players[gameState.currentPlayerIndex];
}

function getCurrentTileIndex(gameState: GameState, selectedPropertyId: string | null) {
  if (!selectedPropertyId) {
    return getCurrentPlayer(gameState)?.position ?? 0;
  }

  const editionIndex = gameState.edition.tiles.findIndex(
    (tile) => tile.id === selectedPropertyId || tile.name === selectedPropertyId,
  );

  if (editionIndex >= 0) return editionIndex;

  const boardIndex = DEFAULT_BOARD_TILES.findIndex(
    (tile) => tile.name === selectedPropertyId,
  );

  if (boardIndex >= 0) return boardIndex;

  const tileNumber = selectedPropertyId.match(/tile-(\d+)/)?.[1];
  const tileIndex = tileNumber ? Number(tileNumber) : -1;

  return tileIndex >= 0 ? tileIndex : getCurrentPlayer(gameState)?.position ?? 0;
}

function getPropertyDetails(
  gameState: GameState,
  selectedPropertyId: string | null,
): PropertyDetails {
  const tileIndex = getCurrentTileIndex(gameState, selectedPropertyId);
  const boardTile = DEFAULT_BOARD_TILES[tileIndex % DEFAULT_BOARD_TILES.length];
  const editionTile = gameState.edition.tiles[tileIndex];

  const id = editionTile?.id ?? boardTile?.name ?? `tile-${tileIndex}`;
  const name = boardTile?.name ?? editionTile?.name ?? `Tile ${tileIndex}`;
  const color = boardTile?.color ?? "#7b1e2b";
  const price = 100 + Math.floor(tileIndex / 5) * 50;
  const rent = Math.max(10, Math.round(price * 0.18));
  const sellValue = Math.round(price * 0.5);

  return {
    id,
    name,
    color,
    description:
      editionTile?.description ??
      "A Sanskrit Monopoly property card. Buy it to collect rent when other players land here.",
    price,
    rent,
    rentWithSet: rent * 2,
    sellValue,
    tileIndex,
  };
}

function getOwnedProperties(gameState: GameState, ownedPropertyIds: string[]) {
  return Array.from(new Set(ownedPropertyIds)).map((propertyId) =>
    getPropertyDetails(gameState, propertyId),
  );
}

function ownsProperty(ownedPropertyIds: string[], property: PropertyDetails) {
  return ownedPropertyIds.includes(property.id) || ownedPropertyIds.includes(property.name);
}

export function PropertyTitleOverlay({
  gameState,
  isActivePlayer,
  selectedPropertyId,
  ownedPropertyIds,
  currentMoney,
  propertyOwnerName,
  canManageProperty,
  onBuyProperty,
  onDeclineProperty,
  onSellProperty,
  onClose,
}: PropertyTitleOverlayProps) {
  const property = getPropertyDetails(gameState, selectedPropertyId);
  const ownedProperties = useMemo(
    () => getOwnedProperties(gameState, ownedPropertyIds),
    [gameState, ownedPropertyIds],
  );

  const alreadyOwned = ownsProperty(ownedPropertyIds, property);
  const canAfford = currentMoney >= property.price;

  const [selectedSellId, setSelectedSellId] = useState<string | null>(
    ownedProperties[0]?.id ?? null,
  );

  const selectedSellProperty = ownedProperties.find(
    (ownedProperty) => ownedProperty.id === selectedSellId,
  );

  const canSellAndBuy =
    Boolean(selectedSellProperty) &&
    currentMoney + (selectedSellProperty?.sellValue ?? 0) >= property.price;

  const handleSellAndBuy = () => {
    if (!selectedSellProperty || !canSellAndBuy || !canManageProperty) return;

    onSellProperty(selectedSellProperty.id, selectedSellProperty.sellValue);
    onBuyProperty(property.id, property.price);
  };

  const actionDisabled = !isActivePlayer || !canManageProperty;

  return (
    <GameOverlayShell>
      <div className="max-h-[82vh] overflow-y-auto rounded-[22px] border-[5px] border-[#6b3f1d] bg-[#fff4dc] text-[#160f08] shadow-inner">
        <div
          className="h-16 border-b-[5px] border-[#6b3f1d]"
          style={{ backgroundColor: property.color }}
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6b3f1d]">
                Property Title Card
              </p>
              <h2 className="mt-2 text-[34px] font-extrabold leading-tight text-[#160f08]">
                {property.name}
              </h2>
              <p className="mt-1 text-sm font-bold text-[#6b3f1d]">
                Position {property.tileIndex} • Owner: {alreadyOwned ? propertyOwnerName : "Unowned"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#6b3f1d] px-4 py-2 text-sm font-extrabold text-white shadow-md hover:bg-[#8a5428]"
            >
              Close
            </button>
          </div>

          <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-left text-sm font-semibold leading-relaxed text-[#6b3f1d]">
            {property.description}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">Price</p>
              <p className="mt-1 text-2xl font-extrabold">${property.price}</p>
            </div>

            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">Rent</p>
              <p className="mt-1 text-2xl font-extrabold">${property.rent}</p>
            </div>

            <div className="rounded-2xl bg-[#f5bd78] px-3 py-4 shadow-sm">
              <p className="text-xs font-extrabold uppercase text-[#6b3f1d]">Sell</p>
              <p className="mt-1 text-2xl font-extrabold">${property.sellValue}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border-[4px] border-[#ffa23b] bg-white/70 p-4 text-left">
            <p className="text-sm font-extrabold uppercase text-[#6b3f1d]">Rent Rules</p>
            <p className="mt-2 text-sm font-semibold text-[#160f08]">
              Base rent is ${property.rent}. If the player owns the full color set, rent can become ${property.rentWithSet}.
            </p>
          </div>

          <p className="mt-4 text-lg font-extrabold text-[#160f08]">
            {propertyOwnerName}'s money: ${currentMoney}
          </p>

          {!alreadyOwned && (
            <div className="mt-5 space-y-3">
              {canAfford ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={actionDisabled}
                    onClick={() => onBuyProperty(property.id, property.price)}
                    className="h-[54px] flex-1 rounded-2xl border-[5px] border-[#ffa23b] bg-[#e84a15] text-lg font-extrabold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Buy Property
                  </button>

                  <button
                    type="button"
                    onClick={onDeclineProperty}
                    className="h-[54px] flex-1 rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] text-lg font-extrabold text-[#6b3f1d] shadow-md hover:bg-white"
                  >
                    Do Not Buy
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#fff1e5] p-4 text-left">
                  <p className="text-base font-extrabold text-[#b33a3a]">
                    You need ${property.price - currentMoney} more to buy this property.
                  </p>

                  {ownedProperties.length > 0 ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
                        Sell one of your owned properties to raise money.
                      </p>

                      <div className="mt-4 max-h-[170px] space-y-2 overflow-y-auto pr-1">
                        {ownedProperties.map((ownedProperty) => (
                          <button
                            key={ownedProperty.id}
                            type="button"
                            onClick={() => setSelectedSellId(ownedProperty.id)}
                            className={`flex w-full items-center justify-between rounded-2xl border-[4px] px-4 py-3 text-left font-bold shadow-sm ${
                              selectedSellId === ownedProperty.id
                                ? "border-[#e84a15] bg-[#ffd7a3] text-[#160f08]"
                                : "border-[#ffa23b] bg-white/70 text-[#6b3f1d]"
                            }`}
                          >
                            <span>{ownedProperty.name}</span>
                            <span>Sell ${ownedProperty.sellValue}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={actionDisabled || !canSellAndBuy}
                        onClick={handleSellAndBuy}
                        className="mt-4 h-[54px] w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#e84a15] text-lg font-extrabold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Sell Selected & Buy
                      </button>
                    </>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
                      This player does not have another property to sell yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {alreadyOwned && selectedPropertyId && (
                <div className="mt-5 rounded-2xl bg-[#fff1e5] p-4">
                    <p className="text-lg font-extrabold text-[#160f08]">
                    {propertyOwnerName} already owns this property.
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
                    Do you want to sell this property?
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        disabled={actionDisabled}
                        onClick={() => onSellProperty(property.id, property.sellValue)}
                        className="h-[54px] flex-1 rounded-2xl border-[5px] border-[#ffa23b] bg-[#b33a3a] text-lg font-extrabold text-white shadow-md hover:bg-[#c84a4a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Yes, Sell It
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-[54px] flex-1 rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] text-lg font-extrabold text-[#6b3f1d] shadow-md hover:bg-white"
                    >
                        No, Keep It
                    </button>
                    </div>
                </div>
                )}

{alreadyOwned && !selectedPropertyId && (
  <div className="mt-5 rounded-2xl bg-[#fff1e5] p-4">
    <p className="text-lg font-extrabold text-[#160f08]">
      {propertyOwnerName} now owns this property.
    </p>

    <p className="mt-2 text-sm font-semibold text-[#6b3f1d]">
      The sell option is only shown when you click this property from the property list.
    </p>

    <button
      type="button"
      onClick={onClose}
      className="mt-4 h-[54px] w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#fff4dc] text-lg font-extrabold text-[#6b3f1d] shadow-md hover:bg-white"
    >
      Close
    </button>
  </div>
)}

          {actionDisabled && (
            <p className="mt-4 text-sm font-bold text-[#6b3f1d]">
              You can view this card, but buying and selling are only active for the current player during their turn.
            </p>
          )}
        </div>
      </div>
    </GameOverlayShell>
  );
}
