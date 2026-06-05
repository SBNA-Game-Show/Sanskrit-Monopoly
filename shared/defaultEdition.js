// shared/defaultEdition.js

export const DEFAULT_EDITION = {
  id: "default",
  name: "Default Sanskrit Monopoly",
  startingPoints: 0,
  tiles: Array.from({ length: 40 }, (_, index) => ({
    id: `tile-${index}`,
    name: index === 0 ? "Start" : `Tile ${index}`,
    type: index === 0 ? "start" : index % 5 === 0 ? "penalty" : "reward",
    points: index === 0 ? 0 : index % 5 === 0 ? -50 : 25,
  })),
};
