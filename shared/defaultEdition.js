// shared/defaultEdition.js

export const BOARD_TILES = [
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

export const DEFAULT_EDITION = {
  id: "default",
  name: "Default Sanskrit Monopoly",
  startingPoints: 0,
  tiles: BOARD_TILES.map((tile, index) => ({
    id: `tile-${index}`,
    ...tile,
  })),
};
