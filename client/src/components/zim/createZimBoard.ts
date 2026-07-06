import * as zim from "zimjs";
import {
  BOARD_SIZE,
  CORNER_SIZE,
  TILE_HEIGHT,
  TILE_WIDTH,
  PLAYER_COLORS,
  TOKEN_OFFSETS,
} from "../../constants/zim/board";
import type {
  TileCenter,
  ZimBoardController,
  ZimBoardState,
} from "../../types/zim/zimBoardTypes";
import { TOKEN_IMAGE_BY_ID } from "../../constants/game/tokenOptions";
import type { GameEdition, GameTile } from "../../types/game/gameTypes";

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

const TILE_COUNT = 40;

function buildTilePath(from: number, to: number): number[] {
  const path = [from];
  let pos = from;
  while (pos !== to) {
    pos = (pos + 1) % TILE_COUNT;
    path.push(pos);
  }
  return path;
}

function getOwnershipMarkerPosition(tileIndex: number): TileCenter {
  const center = getTileCenter(tileIndex);
  const normalizedIndex = tileIndex % 40;

  if (normalizedIndex >= 1 && normalizedIndex <= 9) {
    return { x: center.x, y: BOARD_SIZE - 18 };
  }

  if (normalizedIndex >= 11 && normalizedIndex <= 19) {
    return { x: 18, y: center.y };
  }

  if (normalizedIndex >= 21 && normalizedIndex <= 29) {
    return { x: center.x, y: 18 };
  }

  if (normalizedIndex >= 31 && normalizedIndex <= 39) {
    return { x: BOARD_SIZE - 18, y: center.y };
  }

  return center;
}

function isOwnableBoardTile(tile: GameTile | undefined) {
  return (
    tile?.type === "property" ||
    tile?.type === "railroad" ||
    tile?.type === "utility"
  );
}

function drawCorner(
  board: zim.Container,
  tile: GameTile,
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
  tile: GameTile,
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
}

function drawStaticBoard(edition: GameEdition, stage: zim.Stage) {
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
    edition.tiles[0],
    BOARD_SIZE - CORNER_SIZE,
    BOARD_SIZE - CORNER_SIZE,
  );
  drawCorner(board, edition.tiles[10], 0, BOARD_SIZE - CORNER_SIZE);
  drawCorner(board, edition.tiles[20], 0, 0);
  drawCorner(board, edition.tiles[30], BOARD_SIZE - CORNER_SIZE, 0);

  for (let i = 0; i < 9; i += 1) {
    drawTile(
      board,
      edition.tiles[i + 1],
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
      edition.tiles[i + 11],
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
      edition.tiles[i + 21],
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
      edition.tiles[i + 31],
      BOARD_SIZE - CORNER_SIZE,
      CORNER_SIZE + i * TILE_WIDTH,
      TILE_HEIGHT,
      TILE_WIDTH,
      "right",
    );
  }

  return board;
}

function drawOwnershipMarkers(
  edition: GameEdition,
  board: zim.Container,
  ownedTiles: ZimBoardState["ownedTiles"],
) {
  if (!ownedTiles) return;

  Object.entries(ownedTiles).forEach(([tileId, ownerToken]) => {
    const tileIndex = edition.tiles.findIndex((tile) => tile.id === tileId);
    if (tileIndex === null) return;

    const tile = edition.tiles[tileIndex];

    if (!isOwnableBoardTile(tile)) return;

    const markerPosition = getOwnershipMarkerPosition(tileIndex);
    const tokenUrl = TOKEN_IMAGE_BY_ID[ownerToken];

    if (tokenUrl) {
      new zim.Pic({ file: tokenUrl })
        .siz(20)
        .loc(markerPosition.x - 10, markerPosition.y - 10, board);

      return;
    }

    new zim.Circle(7, "#f4e8c8", "#111", 2).loc(
      markerPosition.x - 7,
      markerPosition.y - 7,
      board,
    );
  });
}

// dynamic layer keys let the board skip work when only unrelated game state changes
// static tile art draws when dice, ownership markers, and players update on their own

function getDiceLayerKey(state: ZimBoardState) {
  return String(state.lastRoll ?? "");
}

// ownership markers only depend on tile ownership not player position or turn state
function getOwnershipLayerKey(state: ZimBoardState) {
  return Object.entries(state.ownedTiles ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tileId, ownerToken]) => `${tileId}:${ownerToken}`)
    .join("|");
}

// player visuals depend on turn highlight, token identity, position, and elimination
function getPlayersLayerKey(state: ZimBoardState) {
  return [
    state.currentTurnUid ?? "",
    ...state.players.map((player) =>
      [
        player.uid,
        player.token ?? "",
        player.position,
        player.isEliminated ? 1 : 0,
      ].join(":"),
    ),
  ].join("|");
}

export function createZimBoard(
  stage: zim.Stage,
  initialState: ZimBoardState,
  _actions?: any, //keep this here or board will break (and keep the underscore too)
  edition?: GameEdition,
): ZimBoardController {
  if (!edition) {
    throw new Error("GameEdition is required for createZimBoard");
  }
  let board: zim.Container | null = null;
  let ownershipLayer: zim.Container | null = null;
  let playerLayer: zim.Container | null = null;
  let diceLayer: zim.Container | null = null;
  let lastDiceLayerKey: string | null = null;
  let lastOwnershipLayerKey: string | null = null;
  let lastPlayersLayerKey: string | null = null;
  const prevPositions = new Map<string, number>();

  // player token displays are cached so movement can reuse existing ZIM objects
  // image tokens can resize in place when only active/inactive turn size changes
  type PlayerDisplay = {
    node: zim.Pic | zim.Container;
    tokenId: string | null;
    size: number;
    isImageToken: boolean;
  };

  const playerDisplays = new Map<string, PlayerDisplay>();

  // function that updates existing token displays instead of clearing / recreating player layer
  function updatePlayers(
    layer: zim.Container,
    players: ZimBoardState["players"],
    currentTurnUid: string | null,
    prevPositions: Map<string, number>,
    playerDisplays: Map<string, PlayerDisplay>,
  ) {
    const activePlayerUids = new Set(players.map((player) => player.uid));

    playerDisplays.forEach((display, uid) => {
      if (!activePlayerUids.has(uid)) {
        display.node.removeFrom();
        playerDisplays.delete(uid);
        prevPositions.delete(uid);
      }
    });

    players.forEach((player, playerIndex) => {
      const offset = TOKEN_OFFSETS[playerIndex] ?? { dx: 0, dy: 0 };
      const isCurrentTurn = player.uid === currentTurnUid;
      const size = isCurrentTurn ? 42 : 34;
      const tokenId = player.token ?? null;

      const prevPosition = prevPositions.get(player.uid);
      const shouldAnimate =
        prevPosition != null && prevPosition !== player.position;

      const display =
        playerDisplays.get(player.uid) ??
        createPlayerDisplay(layer, player, playerIndex, size);

      const needsRecreate =
        display.tokenId !== tokenId ||
        (!display.isImageToken && display.size !== size);

      const nextDisplay = needsRecreate
        ? recreatePlayerDisplay(
            layer,
            playerDisplays,
            player,
            playerIndex,
            size,
          )
        : display;

      if (
        !needsRecreate &&
        nextDisplay.isImageToken &&
        nextDisplay.size !== size
      ) {
        nextDisplay.node.siz(size);
        nextDisplay.size = size;
      }

      playerDisplays.set(player.uid, nextDisplay);

      const startCenter = shouldAnimate
        ? getTileCenter(prevPosition)
        : getTileCenter(player.position);

      nextDisplay.node.loc(
        startCenter.x + offset.dx - size / 2,
        startCenter.y + offset.dy - size / 2,
      );

      if (shouldAnimate) {
        animatePlayerToPosition(
          nextDisplay.node,
          prevPosition,
          player.position,
          offset,
          size,
        );
      }

      prevPositions.set(player.uid, player.position);
    });
  }

  // function that creates token display once, then stores it in playerDisplays to be reused
  function createPlayerDisplay(
    layer: zim.Container,
    player: ZimBoardState["players"][number],
    playerIndex: number,
    size: number,
  ): PlayerDisplay {
    const tokenId = player.token ?? null;
    const tokenUrl = tokenId ? TOKEN_IMAGE_BY_ID[tokenId] : null;

    if (tokenUrl) {
      return {
        node: new zim.Pic({ file: tokenUrl }).siz(size).addTo(layer),
        tokenId,
        size,
        isImageToken: true,
      };
    }

    // fallback for dev state where player has no valid token image
    const node = new zim.Container(size, size).addTo(layer);
    const radius = size / 2 - 2;

    new zim.Circle(
      radius,
      PLAYER_COLORS[playerIndex] ?? "#000",
      "#111",
      3,
    ).center(node);

    new zim.Label({
      text: `${playerIndex + 1}`,
      size: 13,
      bold: true,
      color: "#fff",
      font: "Arial",
      align: "center",
    }).center(node);

    return { node, tokenId, size, isImageToken: false };
  }

  // recreate only when the token identity changes or for fallback shape resizing
  function recreatePlayerDisplay(
    layer: zim.Container,
    playerDisplays: Map<string, PlayerDisplay>,
    player: ZimBoardState["players"][number],
    playerIndex: number,
    size: number,
  ) {
    playerDisplays.get(player.uid)?.node.removeFrom();
    return createPlayerDisplay(layer, player, playerIndex, size);
  }

  // create static board art once while dynamic layers sit above it
  function createLayers(initialState: ZimBoardState) {
    board = drawStaticBoard(edition!, stage);

    ownershipLayer = new zim.Container(BOARD_SIZE, BOARD_SIZE).addTo(board);
    playerLayer = new zim.Container(BOARD_SIZE, BOARD_SIZE).addTo(board);
    diceLayer = new zim.Container(BOARD_SIZE, BOARD_SIZE).addTo(board);

    redrawDynamicLayers(initialState);
  }

  // function that has the tokens walk tile-by-tile
  function animatePlayerToPosition(
    node: zim.Pic | zim.Container,
    fromPosition: number,
    toPosition: number,
    offset: { dx: number; dy: number },
    size: number,
  ) {
    const path = buildTilePath(fromPosition, toPosition);
    const stepTime = 0.4 / Math.max(path.length - 1, 1);

    let step = 1;

    const walk = () => {
      if (step >= path.length) return;

      const next = getTileCenter(path[step]);

      node.animate({
        props: {
          x: next.x + offset.dx - size / 2,
          y: next.y + offset.dy - size / 2,
        },
        time: stepTime,
        ease: "linear",
        call: () => {
          step += 1;
          if (step < path.length) walk();
        },
      });
    };

    walk();
  }

  // function that compares layer keys and updates only layers where the visible inputs have changed
  function redrawDynamicLayers(state: ZimBoardState) {
    const diceLayerKey = getDiceLayerKey(state);
    const ownershipLayerKey = getOwnershipLayerKey(state);
    const playersLayerKey = getPlayersLayerKey(state);

    let didUpdate = false;

    // each dynamic layer redraws only when its own inputs are changed that are board-visible
    
    // for ownership when buying and selling is done
    if (ownershipLayer && ownershipLayerKey !== lastOwnershipLayerKey) {
      ownershipLayer.removeAllChildren();
      drawOwnershipMarkers(edition!, ownershipLayer, state.ownedTiles);
      lastOwnershipLayerKey = ownershipLayerKey;
      didUpdate = true;

      console.count("ZIM ownership layer"); // for debugging
    }

    // for general player movement on the board
    if (playerLayer && playersLayerKey !== lastPlayersLayerKey) {
      updatePlayers(
        playerLayer,
        state.players,
        state.currentTurnUid,
        prevPositions,
        playerDisplays,
      );

      lastPlayersLayerKey = playersLayerKey;
      didUpdate = true;

      console.count("ZIM player layer"); // for debugging
    }

    // dice. Pretty self-explanatory
    if (diceLayer && diceLayerKey !== lastDiceLayerKey) {
      diceLayer.removeAllChildren();
      drawDice(diceLayer, state.lastRoll);
      lastDiceLayerKey = diceLayerKey;
      didUpdate = true;

      console.count("ZIM dice layer"); // for debugging
    }

    if (didUpdate) {
      stage.update();
    }
  }

  createLayers(initialState);

  return {
    update(nextState: ZimBoardState) {
      redrawDynamicLayers(nextState);
    },

    dispose() {
      stage.removeAllChildren();
      stage.update();

      board = null;
      ownershipLayer = null;
      playerLayer = null;
      diceLayer = null;
      playerDisplays.clear();
      prevPositions.clear();
    },
  };
}
