import { useEffect, useRef } from "react";
import * as zim from "zimjs";

type ZimMonopolyBoardProps = {
  positions: number[];
  currentPlayerIndex: number;
};

const TILES = [
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

const PLAYER_COLORS = ["#d72638", "#2f80ed", "#f2c94c", "#27ae60", "#9b51e0"];

const TOKEN_OFFSETS = [
  { dx: -15, dy: -15 },
  { dx: 15, dy: -15 },
  { dx: -15, dy: 15 },
  { dx: 15, dy: 15 },
  { dx: 0, dy: 0 },
];

function getTileCenter(
  tileIndex: number,
  boardSize: number,
  corner: number,
  tileW: number
) {
  if (tileIndex === 0) return { x: boardSize - corner / 2, y: boardSize - corner / 2 };
  if (tileIndex === 10) return { x: corner / 2, y: boardSize - corner / 2 };
  if (tileIndex === 20) return { x: corner / 2, y: corner / 2 };
  if (tileIndex === 30) return { x: boardSize - corner / 2, y: corner / 2 };

  if (tileIndex >= 1 && tileIndex <= 9) {
    const i = tileIndex - 1;
    return {
      x: boardSize - corner - i * tileW - tileW / 2,
      y: boardSize - corner / 2,
    };
  }

  if (tileIndex >= 11 && tileIndex <= 19) {
    const i = tileIndex - 11;
    return {
      x: corner / 2,
      y: boardSize - corner - i * tileW - tileW / 2,
    };
  }

  if (tileIndex >= 21 && tileIndex <= 29) {
    const i = tileIndex - 21;
    return {
      x: corner + i * tileW + tileW / 2,
      y: corner / 2,
    };
  }

  if (tileIndex >= 31 && tileIndex <= 39) {
    const i = tileIndex - 31;
    return {
      x: boardSize - corner / 2,
      y: corner + i * tileW + tileW / 2,
    };
  }

  return { x: 0, y: 0 };
}

function drawBoard(stage: any, positions: number[], currentPlayerIndex: number) {
  const BOARD = 900;
  const CORNER = 115;
  const TILE_W = (BOARD - CORNER * 2) / 9;
  const TILE_H = CORNER;

  stage.removeAllChildren();

  const board = new zim.Container(BOARD, BOARD).center(stage);

  new zim.Rectangle(BOARD, BOARD, "#6b3f1d", "#3a2110", 6).addTo(board);
  new zim.Rectangle(BOARD - 30, BOARD - 30, "#f4e8c8", "#3a2110", 3)
    .pos(15, 15, false, false, board);

  new zim.Rectangle(
    BOARD - CORNER * 2,
    BOARD - CORNER * 2,
    "#202733",
    "#3a2110",
    4
  ).pos(CORNER, CORNER, false, false, board);

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

  function drawCorner(tile: (typeof TILES)[0], x: number, y: number) {
    const g = new zim.Container(CORNER, CORNER).pos(x, y, false, false, board);
    new zim.Rectangle(CORNER, CORNER, tile.color, "#3a2110", 2).addTo(g);

    new zim.Label({
      text: tile.name,
      size: 17,
      bold: true,
      color: "#2a1c12",
      font: "Georgia",
      align: "center",
      lineWidth: CORNER - 12,
    }).center(g);
  }

  function drawTile(
    tile: (typeof TILES)[0],
    x: number,
    y: number,
    w: number,
    h: number,
    side: "bottom" | "left" | "top" | "right"
  ) {
    const g = new zim.Container(w, h).pos(x, y, false, false, board);

    new zim.Rectangle(w, h, "#fff8e8", "#3a2110", 1).addTo(g);

    if (tile.type === "property") {
      const bar = 22;

      if (side === "bottom") {
        new zim.Rectangle(w, bar, tile.color, "transparent", 0).pos(0, 0, false, false, g);
      }

      if (side === "top") {
        new zim.Rectangle(w, bar, tile.color, "transparent", 0).pos(0, h - bar, false, false, g);
      }

      if (side === "left") {
        new zim.Rectangle(bar, h, tile.color, "transparent", 0).pos(w - bar, 0, false, false, g);
      }

      if (side === "right") {
        new zim.Rectangle(bar, h, tile.color, "transparent", 0).pos(0, 0, false, false, g);
      }
    } else {
      new zim.Rectangle(w, h, tile.color, "transparent", 0).addTo(g);
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

    label.center(g);

    if (side === "left") label.rot(90);
    if (side === "right") label.rot(-90);
  }

  drawCorner(TILES[0], BOARD - CORNER, BOARD - CORNER);
  drawCorner(TILES[10], 0, BOARD - CORNER);
  drawCorner(TILES[20], 0, 0);
  drawCorner(TILES[30], BOARD - CORNER, 0);

  for (let i = 0; i < 9; i++) {
    drawTile(
      TILES[i + 1],
      BOARD - CORNER - (i + 1) * TILE_W,
      BOARD - CORNER,
      TILE_W,
      TILE_H,
      "bottom"
    );
  }

  for (let i = 0; i < 9; i++) {
    drawTile(
      TILES[i + 11],
      0,
      BOARD - CORNER - (i + 1) * TILE_W,
      TILE_H,
      TILE_W,
      "left"
    );
  }

  for (let i = 0; i < 9; i++) {
    drawTile(
      TILES[i + 21],
      CORNER + i * TILE_W,
      0,
      TILE_W,
      TILE_H,
      "top"
    );
  }

  for (let i = 0; i < 9; i++) {
    drawTile(
      TILES[i + 31],
      BOARD - CORNER,
      CORNER + i * TILE_W,
      TILE_H,
      TILE_W,
      "right"
    );
  }

  positions.forEach((tileIndex, playerIndex) => {
    const center = getTileCenter(tileIndex, BOARD, CORNER, TILE_W);
    const offset = TOKEN_OFFSETS[playerIndex] || { dx: 0, dy: 0 };

    const token = new zim.Circle(
      playerIndex === currentPlayerIndex ? 19 : 15,
      PLAYER_COLORS[playerIndex] || "#000",
      "#111",
      3
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

  stage.update();
}

function ZimMonopolyBoard({ positions, currentPlayerIndex }: ZimMonopolyBoardProps) {
  const holderIdRef = useRef(`zim-board-${Math.random().toString(36).slice(2)}`);
  const frameRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    frameRef.current = new zim.Frame({
      scaling: holderIdRef.current,
      width: 900,
      height: 900,
      color: "#202733",
      ready: () => {
        stageRef.current = frameRef.current.stage;
        drawBoard(stageRef.current, positions, currentPlayerIndex);
      },
    });

    return () => {
      frameRef.current?.dispose?.();

      const holder = document.getElementById(holderIdRef.current);
      if (holder) holder.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    drawBoard(stageRef.current, positions, currentPlayerIndex);
  }, [positions, currentPlayerIndex]);

  return (
    <div className="h-full w-full">
      <div
        id={holderIdRef.current}
        className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full"
      />
    </div>
  );
}

export default ZimMonopolyBoard;