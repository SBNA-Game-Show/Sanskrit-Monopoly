import { useEffect, useRef } from "react";
import * as zim from "zimjs";

type ZimMonopolyBoardProps = {
  positions: number[];
  currentPlayerIndex: number;
  diceValue?: number | null;
};

const TILES = [
  "आरम्भः", "काशी", "प्रश्नः", "नालन्दा", "दण्डः", "यात्रा", "सोमनाथः", "भाग्यम्", "बद्रीनाथः", "केदारः",
  "विश्रामः", "सत्यम्", "विद्युत्", "धर्मः", "सेवा", "रथः", "गङ्गा", "प्रश्नः", "यमुना", "सरस्वती",
  "मुक्तम्", "गीता", "भाग्यम्", "कर्मः", "भक्तिः", "यात्रा", "दीपावली", "होली", "जलम्", "नवरात्रिः",
  "परीक्षा", "रामेश्वरम्", "द्वारका", "प्रश्नः", "पुरी", "यात्रा", "भाग्यम्", "तक्षशिला", "दण्डः", "संस्कृतम्",
];

const TILE_COLORS = [
  "#f4e8c8", "#7b1e2b", "#f4e8c8", "#7b1e2b", "#e8b4a6", "#d9c3a3", "#274c3b", "#f4e8c8", "#274c3b", "#274c3b",
  "#f4e8c8", "#b85c38", "#f4e8c8", "#b85c38", "#b85c38", "#d9c3a3", "#3f6f8f", "#f4e8c8", "#3f6f8f", "#3f6f8f",
  "#f4e8c8", "#d6a84f", "#f4e8c8", "#d6a84f", "#d6a84f", "#d9c3a3", "#a13c24", "#a13c24", "#f4e8c8", "#a13c24",
  "#f4e8c8", "#5d3a8c", "#5d3a8c", "#f4e8c8", "#5d3a8c", "#d9c3a3", "#f4e8c8", "#214f7a", "#e8b4a6", "#214f7a",
];

const PLAYER_COLORS = ["#d72638", "#2f80ed", "#f2c94c", "#27ae60"];
const TOKEN_OFFSETS = [
  { dx: -15, dy: -15 },
  { dx: 15, dy: -15 },
  { dx: -15, dy: 15 },
  { dx: 15, dy: 15 },
];

function getTileCenter(tileIndex: number, boardSize: number, corner: number, tileW: number) {
  if (tileIndex === 0) return { x: boardSize - corner / 2, y: boardSize - corner / 2 };
  if (tileIndex === 10) return { x: corner / 2, y: boardSize - corner / 2 };
  if (tileIndex === 20) return { x: corner / 2, y: corner / 2 };
  if (tileIndex === 30) return { x: boardSize - corner / 2, y: corner / 2 };

  if (tileIndex >= 1 && tileIndex <= 9) {
    const i = tileIndex - 1;
    return { x: boardSize - corner - i * tileW - tileW / 2, y: boardSize - corner / 2 };
  }

  if (tileIndex >= 11 && tileIndex <= 19) {
    const i = tileIndex - 11;
    return { x: corner / 2, y: boardSize - corner - i * tileW - tileW / 2 };
  }

  if (tileIndex >= 21 && tileIndex <= 29) {
    const i = tileIndex - 21;
    return { x: corner + i * tileW + tileW / 2, y: corner / 2 };
  }

  if (tileIndex >= 31 && tileIndex <= 39) {
    const i = tileIndex - 31;
    return { x: boardSize - corner / 2, y: corner + i * tileW + tileW / 2 };
  }

  return { x: 0, y: 0 };
}

function drawDice(board: zim.Container, diceValue: number | null | undefined) {
  const dice = new zim.Container(110, 110).pos(620, 560, false, false, board);
  new zim.Rectangle(110, 110, "#f4e8c8", "#6b3f1d", 5, 18).addTo(dice);

  new zim.Label({
    text: diceValue ? String(diceValue) : "—",
    size: 60,
    bold: true,
    color: "#2a1c12",
    font: "Arial",
    align: "center",
  }).center(dice);

  new zim.Label({
    text: "Dice",
    size: 14,
    color: "#6b3f1d",
    font: "Arial",
    align: "center",
  }).pos(0, 82, false, false, dice).centerReg(dice);
}

function drawBoard(stage: zim.Stage, positions: number[], currentPlayerIndex: number, diceValue?: number | null) {
  const boardSize = 900;
  const corner = 115;
  const tileW = (boardSize - corner * 2) / 9;
  const tileH = corner;

  stage.removeAllChildren();

  const board = new zim.Container(boardSize, boardSize).center(stage);

  new zim.Rectangle(boardSize, boardSize, "#6b3f1d", "#3a2110", 6).addTo(board);
  new zim.Rectangle(boardSize - 30, boardSize - 30, "#f4e8c8", "#3a2110", 3).pos(15, 15, false, false, board);
  new zim.Rectangle(boardSize - corner * 2, boardSize - corner * 2, "#202733", "#3a2110", 4).pos(corner, corner, false, false, board);

  new zim.Label({
    text: "संस्कृत\nMONOPOLY",
    size: 52,
    bold: true,
    color: "#f4e8c8",
    font: "Georgia",
    align: "center",
    lineHeight: 58,
  }).center(board).rot(-18);

  drawDice(board, diceValue);

  function drawSquareTile(tileIndex: number, x: number, y: number, w: number, h: number, side: "bottom" | "left" | "top" | "right" | "corner") {
    const tile = new zim.Container(w, h).pos(x, y, false, false, board);
    new zim.Rectangle(w, h, "#fff8e8", "#3a2110", 1).addTo(tile);

    const color = TILE_COLORS[tileIndex];
    const isProperty = ![0, 2, 4, 5, 7, 10, 12, 15, 17, 20, 22, 25, 28, 30, 33, 35, 36, 38].includes(tileIndex);

    if (side === "corner") {
      new zim.Rectangle(w, h, "#f7d28b", "#3a2110", 2).addTo(tile);
    } else if (isProperty) {
      if (side === "bottom") new zim.Rectangle(w, 22, color).pos(0, 0, false, false, tile);
      if (side === "top") new zim.Rectangle(w, 22, color).pos(0, h - 22, false, false, tile);
      if (side === "left") new zim.Rectangle(22, h, color).pos(w - 22, 0, false, false, tile);
      if (side === "right") new zim.Rectangle(22, h, color).pos(0, 0, false, false, tile);
    } else {
      new zim.Rectangle(w, h, color).addTo(tile).alp(0.75);
    }

    const label = new zim.Label({
      text: TILES[tileIndex],
      size: side === "corner" ? 16 : 11,
      bold: side === "corner",
      color: "#2a1c12",
      font: "Georgia",
      align: "center",
      lineWidth: side === "left" || side === "right" ? h - 8 : w - 8,
    }).center(tile);

    if (side === "left") label.rot(90);
    if (side === "right") label.rot(-90);
  }

  drawSquareTile(0, boardSize - corner, boardSize - corner, corner, corner, "corner");
  drawSquareTile(10, 0, boardSize - corner, corner, corner, "corner");
  drawSquareTile(20, 0, 0, corner, corner, "corner");
  drawSquareTile(30, boardSize - corner, 0, corner, corner, "corner");

  for (let i = 0; i < 9; i += 1) {
    drawSquareTile(i + 1, boardSize - corner - (i + 1) * tileW, boardSize - corner, tileW, tileH, "bottom");
    drawSquareTile(i + 11, 0, boardSize - corner - (i + 1) * tileW, tileH, tileW, "left");
    drawSquareTile(i + 21, corner + i * tileW, 0, tileW, tileH, "top");
    drawSquareTile(i + 31, boardSize - corner, corner + i * tileW, tileH, tileW, "right");
  }

  positions.forEach((rawTileIndex, playerIndex) => {
    const tileIndex = ((rawTileIndex % 40) + 40) % 40;
    const center = getTileCenter(tileIndex, boardSize, corner, tileW);
    const offset = TOKEN_OFFSETS[playerIndex] || { dx: 0, dy: 0 };
    const tokenSize = playerIndex === currentPlayerIndex ? 20 : 16;

    const token = new zim.Circle(tokenSize, PLAYER_COLORS[playerIndex] || "#000", "#111", 3)
      .loc(center.x + offset.dx, center.y + offset.dy, board);

    new zim.Label({
      text: String(playerIndex + 1),
      size: 13,
      bold: true,
      color: "#fff",
      font: "Arial",
      align: "center",
    }).loc(token.x, token.y, board);
  });

  stage.update();
}

function ZimMonopolyBoard({ positions, currentPlayerIndex, diceValue }: ZimMonopolyBoardProps) {
  const holderIdRef = useRef(`zim-board-${Math.random().toString(36).slice(2)}`);
  const frameRef = useRef<zim.Frame | null>(null);
  const stageRef = useRef<zim.Stage | null>(null);

  useEffect(() => {
    const frame = new zim.Frame({
      scaling: holderIdRef.current,
      width: 900,
      height: 900,
      color: "#202733",
      ready: () => {
        stageRef.current = frame.stage;
        drawBoard(frame.stage, positions, currentPlayerIndex, diceValue);
      },
    });

    frameRef.current = frame;

    return () => {
      frameRef.current?.dispose?.();
      const holder = document.getElementById(holderIdRef.current);
      if (holder) holder.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    drawBoard(stageRef.current, positions, currentPlayerIndex, diceValue);
  }, [positions, currentPlayerIndex, diceValue]);

  return (
    <div className="h-full w-full">
      <div id={holderIdRef.current} className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full" />
    </div>
  );
}

export default ZimMonopolyBoard;
