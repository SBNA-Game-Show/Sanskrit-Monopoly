import {
  fallbackTileRuleInfo,
  tileRuleInfoByType,
} from "../content/monopolyRules";
import type { GameTile } from "../types/game/gameTypes";

// Custom edition tile types fall back to a generic rule block.
export function getRuleInfo(tile: GameTile) {
  return tileRuleInfoByType[tile.type] ?? fallbackTileRuleInfo;
}