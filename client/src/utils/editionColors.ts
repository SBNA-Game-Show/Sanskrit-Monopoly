import {
  PROPERTY_GROUP_COLORS,
  TILE_TYPE_COLORS,
} from "../constants/zim/board";

type ColorableTile = {
  type: string;
  color?: string;
  group?: string;
};

// Keeps board preview colors consistent across rules, lobby setup, and admin editing.
export function getNormalizedTileColor(tile: ColorableTile) {
  const groupColors = PROPERTY_GROUP_COLORS as Record<string, string>;
  const typeColors = TILE_TYPE_COLORS as Record<string, string>;

  if (tile.group && groupColors[tile.group]) {
    return groupColors[tile.group];
  }

  return tile.color ?? typeColors[tile.type] ?? typeColors.special ?? "#f4e8c8";
}

// Applies normalized colors without changing the rest of each tile object.
export function getTilesWithNormalizedColors<TTile extends ColorableTile>(
  tiles: TTile[],
) {
  return tiles.map((tile) => ({
    ...tile,
    color: getNormalizedTileColor(tile),
  }));
}