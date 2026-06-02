import * as zim from "zimjs";
import {
  BOARD_SIZE,
  CORNER_SIZE,
  TILE_HEIGHT,
  TILE_WIDTH,
  DEFAULT_BOARD_TILES,
  PLAYER_COLORS,
  TOKEN_OFFSETS,
} from "../../constants/zim/board";
import type { TileCenter, BoardTileDefinition, ZimBoardController, ZimBoardState } from "../../types/zim/zimBoardTypes";

function getTileCenter(tileIndex: number): TileCenter {
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

function drawCorner(
  board: zim.Container,
  tile: BoardTileDefinition,
  x: number,
  y: number,
) {
  const corner = new zim.Container(CORNER_SIZE, CORNER_SIZE).pos(
    x,
    y,
    false,
    false,
    board,
  );

  new zim.Rectangle(CORNER_SIZE, CORNER_SIZE, tile.color, "#3a2110", 2).addTo(
    corner,
  );

  new zim.Label({
    text: tile.name,
    size: 17,
    bold: true,
    color: "#2a1c12",
    font: "Georgia",
    align: "center",
    lineWidth: CORNER_SIZE - 12,
  }).center(corner);
}

function drawTile(
  board: zim.Container,
  tile: BoardTileDefinition,
  x: number,
  y: number,
  w: number,
  h: number,
  side: "bottom" | "left" | "top" | "right",
) {
  const group = new zim.Container(w, h).pos(x, y, false, false, board);

  new zim.Rectangle(w, h, "#fff8e8", "#3a2110", 1).addTo(group);

  if (tile.type === "property") {
    const bar = 22;

    if (side === "bottom") {
      new zim.Rectangle(w, bar, tile.color, "transparent", 0).pos(
        0,
        0,
        false,
        false,
        group,
      );
    }

    if (side === "top") {
      new zim.Rectangle(w, bar, tile.color, "transparent", 0).pos(
        0,
        h - bar,
        false,
        false,
        group,
      );
    }

    if (side === "left") {
      new zim.Rectangle(bar, h, tile.color, "transparent", 0).pos(
        w - bar,
        0,
        false,
        false,
        group,
      );
    }

    if (side === "right") {
      new zim.Rectangle(bar, h, tile.color, "transparent", 0).pos(
        0,
        0,
        false,
        false,
        group,
      );
    }
  } else {
    new zim.Rectangle(w, h, tile.color, "transparent", 0).addTo(group);
  }

  const label = new zim.Label({
    text: tile.name,
    size: 12,
    bold: tile.type !== "property",
    color: "#2a1c12",
    font: "Georgia",
    align: "center",
    lineWidth: side === "top" || side === "bottom" ? w - 6 : h - 6,
  });

  label.center(group);

  if (side === "left") label.rot(90);
  if (side === "right") label.rot(-90);
}

function drawStaticBoard(stage: zim.Stage) {
  stage.removeAllChildren();

  const board = new zim.Container(BOARD_SIZE, BOARD_SIZE).center(stage);

  new zim.Rectangle(BOARD_SIZE, BOARD_SIZE, "#6b3f1d", "#3a2110", 6).addTo(
    board,
  );

  new zim.Rectangle(
    BOARD_SIZE - 30,
    BOARD_SIZE - 30,
    "#f4e8c8",
    "#3a2110",
    3,
  ).pos(15, 15, false, false, board);

  new zim.Rectangle(
    BOARD_SIZE - CORNER_SIZE * 2,
    BOARD_SIZE - CORNER_SIZE * 2,
    "#202733",
    "#3a2110",
    4,
  ).pos(CORNER_SIZE, CORNER_SIZE, false, false, board);

  new zim.Label({
    text: "संस्कृत\nMONOPOLY",
    size: 52,
    bold: true,
    color: "#f4e8c8",
    font: "Georgia",
    align: "center",
    lineHeight: 58,
  })
    .center(board)
    .rot(-18);

  drawCorner(
    board,
    DEFAULT_BOARD_TILES[0],
    BOARD_SIZE - CORNER_SIZE,
    BOARD_SIZE - CORNER_SIZE,
  );
  drawCorner(board, DEFAULT_BOARD_TILES[10], 0, BOARD_SIZE - CORNER_SIZE);
  drawCorner(board, DEFAULT_BOARD_TILES[20], 0, 0);
  drawCorner(board, DEFAULT_BOARD_TILES[30], BOARD_SIZE - CORNER_SIZE, 0);

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      DEFAULT_BOARD_TILES[i + 1],
      BOARD_SIZE - CORNER_SIZE - (i + 1) * TILE_WIDTH,
      BOARD_SIZE - CORNER_SIZE,
      TILE_WIDTH,
      TILE_HEIGHT,
      "bottom",
    );
  }

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      DEFAULT_BOARD_TILES[i + 11],
      0,
      BOARD_SIZE - CORNER_SIZE - (i + 1) * TILE_WIDTH,
      TILE_HEIGHT,
      TILE_WIDTH,
      "left",
    );
  }

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      DEFAULT_BOARD_TILES[i + 21],
      CORNER_SIZE + i * TILE_WIDTH,
      0,
      TILE_WIDTH,
      TILE_HEIGHT,
      "top",
    );
  }

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      DEFAULT_BOARD_TILES[i + 31],
      BOARD_SIZE - CORNER_SIZE,
      CORNER_SIZE + i * TILE_WIDTH,
      TILE_HEIGHT,
      TILE_WIDTH,
      "right",
    );
  }

  return board;
}

function drawPlayers(
  board: zim.Container,
  players: ZimBoardState["players"],
  currentTurnUid: string | null,
) {
  players.forEach((player, playerIndex) => {
    const center = getTileCenter(player.position);
    const offset = TOKEN_OFFSETS[playerIndex] ?? { dx: 0, dy: 0 };

    const token = new zim.Circle(
      player.uid === currentTurnUid ? 19 : 15,
      PLAYER_COLORS[playerIndex] ?? "#000",
      "#111",
      3,
    );

    token.x = center.x + offset.dx;
    token.y = center.y + offset.dy;
    token.addTo(board);

    new zim.Label({
      text: `${playerIndex + 1}`,
      size: 13,
      bold: true,
      color: "#fff",
      font: "Arial",
      align: "center",
    }).loc(token.x, token.y, board);
  });
}

export function createZimBoard(
  stage: zim.Stage,
  initialState: ZimBoardState,
): ZimBoardController {
  let board: zim.Container | null = null;

  function draw(state: ZimBoardState) {
    board = drawStaticBoard(stage);
    drawPlayers(board, state.players, state.currentTurnUid);
    stage.update();
  }

  draw(initialState);

  return {
    update(nextState: ZimBoardState) {
      draw(nextState);
    },

    dispose() {
      stage.removeAllChildren();
      stage.update();
      board = null;
    },
  };
}
