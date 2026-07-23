import type { GameState, GameTile, PlayerState } from "../types/game/gameTypes";

// These are the only tile types that can be bought, rented, sold, or auctioned.
export function isPurchasableTile(tile: GameTile) {
  return (
    tile.type === "property" ||
    tile.type === "railroad" ||
    tile.type === "utility"
  );
}

// Centralize price fallback so cards, rules, and overlays agree.
export function getTilePrice(tile: GameTile) {
  return tile.price ?? 100;
}

// Railroads and utilities have special defaults; properties scale from price.
export function getTileRent(tile: GameTile) {
  if (tile.type === "railroad") return tile.rent ?? 25;
  if (tile.type === "utility") return tile.rent ?? 4;

  return tile.rent ?? Math.max(10, Math.round(getTilePrice(tile) * 0.1));
}

// Prefer configured sell value, then fall back to half the purchase price.
export function getSellValue(tile: GameTile) {
  return tile.sellValue ?? Math.round(getTilePrice(tile) * 0.5);
}

// Converts a player's owned tile ids into actual tile records.
export function getPlayerProperties(
  gameState: GameState,
  player: PlayerState | null | undefined,
) {
  if (!player) return [];

  return player.properties
    .map((propertyId) =>
      gameState.edition.tiles.find((tile) => tile.id === propertyId),
    )
    .filter((tile): tile is GameTile => Boolean(tile));
}