import type { BoardTileDefinition } from "../../types/zim/zimBoardTypes";

export const BOARD_SIZE = 900;
export const CORNER_SIZE = 115;
export const TILE_WIDTH = (BOARD_SIZE - CORNER_SIZE * 2) / 9;
export const TILE_HEIGHT = CORNER_SIZE;

const BOARD_TILES: BoardTileDefinition[] = [
  { name: "आरम्भः", type: "corner", color: "#f7d28b" },
  { name: "काशी", type: "property", color: "#7b1e2b" },
  { name: "प्रश्नः", type: "special", color: "#f4e8c8" },
  { name: "नालन्दा", type: "property", color: "#7b1e2b" },
  { name: "करः", type: "tax", color: "#e8b4a6" },
  { name: "यात्रा", type: "railroad", color: "#d9c3a3" },
  { name: "सोमनाथः", type: "property", color: "#274c3b" },
  { name: "भाग्यम्", type: "special", color: "#f4e8c8" },
  { name: "बद्रीनाथः", type: "property", color: "#274c3b" },
  { name: "केदारनाथः", type: "property", color: "#274c3b" },

  { name: "विश्रामः", type: "corner", color: "#f7d28b" },
  { name: "सत्यम्", type: "property", color: "#b85c38" },
  { name: "विद्युत्", type: "utility", color: "#f4e8c8" },
  { name: "धर्मः", type: "property", color: "#b85c38" },
  { name: "सेवा", type: "property", color: "#b85c38" },
  { name: "रथमार्गः", type: "railroad", color: "#d9c3a3" },
  { name: "गङ्गा", type: "property", color: "#3f6f8f" },
  { name: "प्रश्नः", type: "special", color: "#f4e8c8" },
  { name: "यमुना", type: "property", color: "#3f6f8f" },
  { name: "सरस्वती", type: "property", color: "#3f6f8f" },

  { name: "मुक्तस्थानम्", type: "corner", color: "#f7d28b" },
  { name: "गीता", type: "property", color: "#d6a84f" },
  { name: "भाग्यम्", type: "special", color: "#f4e8c8" },
  { name: "कर्मयोगः", type: "property", color: "#d6a84f" },
  { name: "भक्तियोगः", type: "property", color: "#d6a84f" },
  { name: "यात्रा", type: "railroad", color: "#d9c3a3" },
  { name: "दीपावली", type: "property", color: "#a13c24" },
  { name: "होली", type: "property", color: "#a13c24" },
  { name: "जलम्", type: "utility", color: "#f4e8c8" },
  { name: "नवरात्रिः", type: "property", color: "#a13c24" },

  { name: "परीक्षा", type: "corner", color: "#f7d28b" },
  { name: "रामेश्वरम्", type: "property", color: "#5d3a8c" },
  { name: "द्वारका", type: "property", color: "#5d3a8c" },
  { name: "प्रश्नः", type: "special", color: "#f4e8c8" },
  { name: "पुरुषोत्तमः", type: "property", color: "#5d3a8c" },
  { name: "यात्रा", type: "railroad", color: "#d9c3a3" },
  { name: "भाग्यम्", type: "special", color: "#f4e8c8" },
  { name: "तक्षशिला", type: "property", color: "#214f7a" },
  { name: "दण्डः", type: "tax", color: "#e8b4a6" },
  { name: "संस्कृतम्", type: "property", color: "#214f7a" },
];

export const DEFAULT_BOARD_TILES = BOARD_TILES;

export const TILE_TYPE_COLORS = {
  corner: "#f7d28b",
  property: "#ffffff",
  special: "#f4e8c8",
  tax: "#e8b4a6",
  railroad: "#d9c3a3",
  utility: "#f4e8c8",
  jail: "#bcbed0ff",
  goToJail: "#cdb7d6ff",
  chance: "#ffd09dff",
  community: "#aee1ffff",
  quiz: "#ceffedff"
};

export const PLAYER_COLORS = [
  "#d72638",
  "#2f80ed",
  "#f2c94c",
  "#27ae60",
  "#9b51e0",
];

export const TOKEN_OFFSETS = [
  { dx: -15, dy: -15 },
  { dx: 15, dy: -15 },
  { dx: -15, dy: 15 },
  { dx: 15, dy: 15 },
  { dx: 0, dy: 0 },
];
