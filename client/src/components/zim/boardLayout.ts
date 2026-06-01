export const BOARD_SIZE = 900;
export const CORNER_SIZE = 115;
export const TILE_WIDTH = (BOARD_SIZE - CORNER_SIZE * 2) / 9;
export const TILE_HEIGHT = CORNER_SIZE;

export type TileCenter = {
  x: number;
  y: number;
};

export function getTileCenter(tileIndex: number): TileCenter {
  const normalizedIndex = tileIndex % 40;

  if (normalizedIndex === 0) {
    return {
      x: BOARD_SIZE - CORNER_SIZE / 2,
      y: BOARD_SIZE - CORNER_SIZE / 2,
    };
  }

  if (normalizedIndex === 10) {
    return {
      x: CORNER_SIZE / 2,
      y: BOARD_SIZE - CORNER_SIZE / 2,
    };
  }

  if (normalizedIndex === 20) {
    return {
      x: CORNER_SIZE / 2,
      y: CORNER_SIZE / 2,
    };
  }

  if (normalizedIndex === 30) {
    return {
      x: BOARD_SIZE - CORNER_SIZE / 2,
      y: CORNER_SIZE / 2,
    };
  }

  if (normalizedIndex >= 1 && normalizedIndex <= 9) {
    const i = normalizedIndex - 1;

    return {
      x: BOARD_SIZE - CORNER_SIZE - i * TILE_WIDTH - TILE_WIDTH / 2,
      y: BOARD_SIZE - CORNER_SIZE / 2,
    };
  }

  if (normalizedIndex >= 11 && normalizedIndex <= 19) {
    const i = normalizedIndex - 11;

    return {
      x: CORNER_SIZE / 2,
      y: BOARD_SIZE - CORNER_SIZE - i * TILE_WIDTH - TILE_WIDTH / 2,
    };
  }

  if (normalizedIndex >= 21 && normalizedIndex <= 29) {
    const i = normalizedIndex - 21;

    return {
      x: CORNER_SIZE + i * TILE_WIDTH + TILE_WIDTH / 2,
      y: CORNER_SIZE / 2,
    };
  }

  const i = normalizedIndex - 31;

  return {
    x: BOARD_SIZE - CORNER_SIZE / 2,
    y: CORNER_SIZE + i * TILE_WIDTH + TILE_WIDTH / 2,
  };
}
