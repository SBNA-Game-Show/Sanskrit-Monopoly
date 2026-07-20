import * as zim from "zimjs";
import {
  BOARD_SIZE,
  CORNER_SIZE,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "../../constants/zim/board";

import type { GameEdition, GameTile } from "../../types/game/gameTypes";

function drawCorner(
  board: zim.Container,
  tile: GameTile,
  x: number,
  y: number,
  tileIndex: number,
  onHover?: (index: number | null) => void,
  onClick?: (index: number) => void,
) {
  const corner = new zim.Container(CORNER_SIZE, CORNER_SIZE).pos(
    x,
    y,
    false,
    false,
    board,
  );

  new zim.Rectangle(
    CORNER_SIZE,
    CORNER_SIZE,
    tile.color,
    "transparent",
    0,
    0,
  ).addTo(corner);

  new zim.Label({
    text: tile.name,
    size: 17,
    bold: true,
    color: "#2a1c12",
    font: "Georgia",
    align: "center",
    lineWidth: CORNER_SIZE - 12,
  }).center(corner);

  // Hover highlight border
  const hoverBorder = new zim.Rectangle(
    CORNER_SIZE,
    CORNER_SIZE,
    "transparent",
    "#ff8c00",
    4,
  ).addTo(corner);
  hoverBorder.visible = false;
  hoverBorder.mouseEnabled = false;

  corner.mouseChildren = false;
  corner.cursor = "pointer";

  corner.on("mouseover", () => {
    hoverBorder.visible = true;
    if (onHover) onHover(tileIndex);
    board.stage.update();
  });

  corner.on("mouseout", () => {
    hoverBorder.visible = false;
    if (onHover) onHover(null);
    board.stage.update();
  });

  corner.on("click", () => {
    if (onClick) onClick(tileIndex);
  });
}

function drawTile(
  board: zim.Container,
  tile: GameTile,
  x: number,
  y: number,
  w: number,
  h: number,
  side: "bottom" | "left" | "top" | "right",
  tileIndex: number,
  onHover?: (index: number | null) => void,
  onClick?: (index: number) => void,
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

  let labelWidth = w - 12;
  const bar = 22;
  if (tile.type === "property" && (side === "left" || side === "right")) {
    labelWidth = w - bar - 12;
  }

  const label = new zim.Label({
    text: tile.name,
    size: 12,
    bold: tile.type !== "property",
    color: "#2a1c12",
    font: "Georgia",
    align: "center",
    lineWidth: labelWidth,
  });

  label.center(group);

  if (tile.type === "property") {
    if (side === "left") {
      label.x -= bar / 2;
    } else if (side === "right") {
      label.x += bar / 2;
    }
  }

  // Hover highlight border
  const hoverBorder = new zim.Rectangle(
    w,
    h,
    "transparent",
    "#ff8c00",
    3,
  ).addTo(group);
  hoverBorder.visible = false;
  hoverBorder.mouseEnabled = false;

  group.mouseChildren = false;
  group.cursor = "pointer";

  group.on("mouseover", () => {
    hoverBorder.visible = true;
    if (onHover) onHover(tileIndex);
    board.stage.update();
  });

  group.on("mouseout", () => {
    hoverBorder.visible = false;
    if (onHover) onHover(null);
    board.stage.update();
  });

  group.on("click", () => {
    if (onClick) onClick(tileIndex);
  });
}

function drawStaticBoard(
  edition: GameEdition,
  stage: zim.Stage,
  onHover?: (index: number | null) => void,
  onClick?: (index: number) => void,
) {
  stage.removeAllChildren();

  const board = new zim.Container(BOARD_SIZE, BOARD_SIZE).center(stage);

  new zim.Rectangle(BOARD_SIZE, BOARD_SIZE, "#6b3f1d", "#3a2110", 6, 0).addTo(
    board,
  );

  new zim.Rectangle(
    BOARD_SIZE - 30,
    BOARD_SIZE - 30,
    "#f4e8c8",
    "#3a2110",
    3,
    0,
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
    edition.tiles[0],
    BOARD_SIZE - CORNER_SIZE,
    BOARD_SIZE - CORNER_SIZE,
    0,
    onHover,
    onClick,
  );
  drawCorner(board, edition.tiles[10], 0, BOARD_SIZE - CORNER_SIZE, 10, onHover, onClick);
  drawCorner(board, edition.tiles[20], 0, 0, 20, onHover, onClick);
  drawCorner(board, edition.tiles[30], BOARD_SIZE - CORNER_SIZE, 0, 30, onHover, onClick);

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      edition.tiles[i + 1],
      BOARD_SIZE - CORNER_SIZE - (i + 1) * TILE_WIDTH,
      BOARD_SIZE - CORNER_SIZE,
      TILE_WIDTH,
      TILE_HEIGHT,
      "bottom",
      i + 1,
      onHover,
      onClick,
    );
  }

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      edition.tiles[i + 11],
      0,
      BOARD_SIZE - CORNER_SIZE - (i + 1) * TILE_WIDTH,
      TILE_HEIGHT,
      TILE_WIDTH,
      "left",
      i + 11,
      onHover,
      onClick,
    );
  }

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      edition.tiles[i + 21],
      CORNER_SIZE + i * TILE_WIDTH,
      0,
      TILE_WIDTH,
      TILE_HEIGHT,
      "top",
      i + 21,
      onHover,
      onClick,
    );
  }

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      edition.tiles[i + 31],
      BOARD_SIZE - CORNER_SIZE,
      CORNER_SIZE + i * TILE_WIDTH,
      TILE_HEIGHT,
      TILE_WIDTH,
      "right",
      i + 31,
      onHover,
      onClick,
    );
  }

  return board;
}

export function createZimBoard(
  stage: zim.Stage,
  _state?: unknown,
  actions?: { 
    onHover?: (index: number | null) => void;
    onClick?: (index: number) => void;
  },
  edition?: GameEdition,
) {
  if (!edition) {
    throw new Error("createZimBoard requires a GameEdition");
  }

  // Draw the static board immediately on creation
  drawStaticBoard(edition, stage, actions?.onHover, actions?.onClick);
  stage.update();

  return {
    update(nextState?: any) {
      if (nextState?.edition) {
        drawStaticBoard(nextState.edition, stage, actions?.onHover, actions?.onClick);
        stage.update();
      }
    },

    dispose() {
      stage.removeAllChildren();
      stage.update();
    },
  };
}
