import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { GameState, PlayerState } from "../types/game/gameTypes";
import { GAME_EVENTS } from "../constants/socket/gameEvents";
import { ZimMonopolyBoard } from "../components/zim/ZimMonopolyBoard";
import { socket } from "../socket";
import { TOKEN_IMAGE_BY_ID } from "../constants/game/tokenOptions";
import { GameOverlayLayer } from "../components/game/GameOverlayLayer";
import { DEFAULT_BOARD_TILES } from "../constants/zim/board";

type GameProps = {
  gameState: GameState;
};

function getPropertyDisplayName(propertyId: string) {
  const boardProperty = DEFAULT_BOARD_TILES.find(
    (tile) => tile.name === propertyId,
  );

  if (boardProperty) return boardProperty.name;

  const tileNumber = propertyId.match(/tile-(\d+)/)?.[1];
  const tileIndex = tileNumber ? Number(tileNumber) : -1;

  return DEFAULT_BOARD_TILES[tileIndex]?.name ?? propertyId;
}

export default function Game({ gameState }: GameProps) {
  //for debugging (KEEP THIS)
  console.log(gameState);

  const { uid } = useAuth();

  const isHost = gameState.host.uid === uid;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const userPlayer = gameState.players.find((player) => player.uid === uid) ?? null;

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  const [selectedPropertyOwnerUid, setSelectedPropertyOwnerUid] = useState<
    string | null
  >(null);

  const [selectedAdminPlayerUid, setSelectedAdminPlayerUid] = useState<
    string | null
  >(null);

  const [ownedPropertyIdsByPlayerId, setOwnedPropertyIdsByPlayerId] = useState<
    Record<string, string[]>
  >({});

  const [soldPropertyIdsByPlayerId, setSoldPropertyIdsByPlayerId] = useState<
    Record<string, string[]>
  >({});

  const [moneyByPlayerId, setMoneyByPlayerId] = useState<Record<string, number>>(
    {},
  );

  const getPlayerOwnedPropertyIds = (player: PlayerState | null) => {
    if (!player) return [];

    const soldPropertyIds = new Set(
      soldPropertyIdsByPlayerId[player.uid] ?? [],
    );

    return Array.from(
      new Set([
        ...(player.properties ?? []),
        ...(ownedPropertyIdsByPlayerId[player.uid] ?? []),
      ]),
    ).filter((propertyId) => !soldPropertyIds.has(propertyId));
  };

  const getPlayerMoney = (player: PlayerState | null) => {
    if (!player) return 0;

    return (
      moneyByPlayerId[player.uid] ??
      (player.money > 0
        ? player.money
        : player.points > 0
          ? player.points
          : 500)
    );
  };

  const selectedPropertyOwner = selectedPropertyOwnerUid
    ? gameState.players.find((player) => player.uid === selectedPropertyOwnerUid) ??
      currentPlayer
    : currentPlayer;

  const selectedPropertyOwnerProperties = getPlayerOwnedPropertyIds(
    selectedPropertyOwner,
  );

  const selectedPropertyOwnerMoney = getPlayerMoney(selectedPropertyOwner);

  const selectedAdminPlayer = selectedAdminPlayerUid
    ? gameState.players.find((player) => player.uid === selectedAdminPlayerUid) ??
      gameState.players[0]
    : gameState.players[0];

  const selectedAdminPlayerProperties = getPlayerOwnedPropertyIds(
    selectedAdminPlayer ?? null,
  );

  const userOwnedPropertyIds = getPlayerOwnedPropertyIds(userPlayer);
  const userMoney = getPlayerMoney(userPlayer);

  const handleBuyProperty = (propertyId: string, price: number) => {
    if (!currentPlayer) return;

    setOwnedPropertyIdsByPlayerId((current) => ({
      ...current,
      [currentPlayer.uid]: Array.from(
        new Set([...(current[currentPlayer.uid] ?? []), propertyId]),
      ),
    }));

    setSoldPropertyIdsByPlayerId((current) => ({
      ...current,
      [currentPlayer.uid]: (current[currentPlayer.uid] ?? []).filter(
        (soldPropertyId) => soldPropertyId !== propertyId,
      ),
    }));

    setMoneyByPlayerId((current) => ({
      ...current,
      [currentPlayer.uid]: Math.max(0, getPlayerMoney(currentPlayer) - price),
    }));

    setSelectedPropertyId(null);
    setSelectedPropertyOwnerUid(null);
  };

  const handleSellProperty = (propertyId: string, sellValue: number) => {
    const actionPlayer = selectedPropertyOwnerUid
      ? gameState.players.find((player) => player.uid === selectedPropertyOwnerUid) ??
        currentPlayer
      : currentPlayer;

    if (!actionPlayer) return;

    const actionPlayerOwnedProperties = getPlayerOwnedPropertyIds(actionPlayer);

    setOwnedPropertyIdsByPlayerId((current) => ({
      ...current,
      [actionPlayer.uid]: (
        current[actionPlayer.uid] ?? actionPlayerOwnedProperties
      ).filter((ownedPropertyId) => ownedPropertyId !== propertyId),
    }));

    setSoldPropertyIdsByPlayerId((current) => ({
      ...current,
      [actionPlayer.uid]: Array.from(
        new Set([...(current[actionPlayer.uid] ?? []), propertyId]),
      ),
    }));

    setMoneyByPlayerId((current) => ({
      ...current,
      [actionPlayer.uid]: getPlayerMoney(actionPlayer) + sellValue,
    }));

    setSelectedPropertyId(null);
    setSelectedPropertyOwnerUid(null);
  };

  const handleDeclineProperty = () => {
    setSelectedPropertyId(null);
    setSelectedPropertyOwnerUid(null);
  };

  const handleOpenPropertyCard = (propertyId: string, ownerUid: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedPropertyOwnerUid(ownerUid);
  };

  const handleClosePropertyOverlay = () => {
    setSelectedPropertyId(null);
    setSelectedPropertyOwnerUid(null);
  };

  const handleSubmitQuizAnswer = (optionId: string) => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.QUIZ_SUBMIT_ANSWER, {
      lobbyCode: gameState.lobbyCode,
      uid,
      optionId,
    });
  };

  const handleRollDice = () => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_ROLL_DICE, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  const handleSkipTurn = () => {
    if (!gameState.lobbyCode || !uid) return;
    socket.emit(GAME_EVENTS.GAME_HOST_SKIP_TURN, {
      lobbyCode: gameState.lobbyCode,
    });
  };

  const handleKickPlayer = (uid: string) => {
    if (!gameState.lobbyCode || !uid) return;
    socket.emit(GAME_EVENTS.GAME_HOST_KICK_PLAYER, {
      lobbyCode: gameState.lobbyCode,
      uid,
    });
  };

  const handleEndGame = () => {
    if (!gameState.lobbyCode || !uid) return;
    socket.emit(GAME_EVENTS.GAME_HOST_END_GAME, {
      lobbyCode: gameState.lobbyCode,
    });
  };

  return (
    <main className="min-h-screen w-full bg-[#fffaf0] font-sans text-[#160f08]">
      <section className="grid min-h-screen grid-cols-1 gap-6 p-6 xl:grid-cols-[340px_1fr_340px]">
        {/* Left: Players */}
        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-5 shadow-xl">
          <h2 className="mb-5 text-[28px] font-bold leading-none text-[#ff514b]">
            Players
          </h2>

          <div className="space-y-5">
            {gameState.players.map((player, index) => {
              const isCurrentTurn = player.uid === currentPlayer?.uid;
              return (
                <div
                  key={player.uid}
                  className={`rounded-2xl border-[6px] p-4 shadow-md ${
                    isCurrentTurn
                      ? "border-[#6b3f1d] bg-[#ffd7a3]"
                      : "border-[#ffa23b] bg-[#ffb45c]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[15px] leading-[1.45]">
                      <p className="font-semibold">
                        Player {index + 1} — {player.username}
                      </p>
                      <p>Position: {player.position}</p>
                      <p>Points: {player.points}</p>
                    </div>

                    {player.token && TOKEN_IMAGE_BY_ID[player.token] ? (
                      <img
                        src={TOKEN_IMAGE_BY_ID[player.token]}
                        alt={`${player.username} token`}
                        className="h-[64px] w-[64px] rounded-xl bg-white/25 object-contain"
                      />
                    ) : (
                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-xl bg-white/25 text-sm text-[#6b3f1d]">
                        No token
                      </div>
                    )}
                  </div>

                  {isHost && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleKickPlayer(player.uid)}
                        className="rounded-full bg-[#b33a3a] px-4 py-2 text-xs font-bold text-white shadow"
                      >
                        Kick
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col">
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[22px] border-[12px] border-[#6b3f1d] bg-[#202733] p-4 shadow-2xl">
            <div className="aspect-square h-full max-h-[calc(100vh-190px)] w-full max-w-[calc(100vh-190px)]">
              <ZimMonopolyBoard
                players={gameState.players}
                currentTurnUid={currentPlayer?.uid ?? ""}
                lastRoll={gameState.lastRoll}
              />
            </div>

            <GameOverlayLayer
              gameState={gameState}
              isHost={gameState.host.uid === uid}
              onSubmitQuizAnswer={handleSubmitQuizAnswer}
              selectedPropertyId={selectedPropertyId}
              selectedPropertyOwnerUid={selectedPropertyOwner?.uid ?? null}
              ownedPropertyIds={selectedPropertyOwnerProperties}
              currentMoney={selectedPropertyOwnerMoney}
              propertyOwnerName={selectedPropertyOwner?.username ?? "Player"}
              onBuyProperty={handleBuyProperty}
              onDeclineProperty={handleDeclineProperty}
              onSellProperty={handleSellProperty}
              onClosePropertyOverlay={handleClosePropertyOverlay}
            />
          </div>
        </section>

        <aside className="max-h-[calc(100vh-48px)] overflow-y-auto rounded-2xl bg-[#f5bd78] p-6 shadow-xl">
          <div className="mb-6 rounded-2xl bg-[#fff4dc] p-4 text-[18px] leading-tight shadow-inner">
            <p className="mb-2 font-bold text-[#6b3f1d]">Current Turn</p>
            <p className="text-[22px] font-semibold text-[#160f08]">
              {currentPlayer?.username ?? "Waiting..."}
            </p>
            <p className="mt-1 text-[#6b3f1d]">
              Last roll: {gameState.lastRoll ?? "—"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-5">
            {isHost ? (
              <>
                <button
                  onClick={handleRollDice}
                  disabled={gameState.gameStatus !== "idling"}
                  className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Force Roll
                </button>
                <button
                  onClick={handleSkipTurn}
                  disabled={gameState.gameStatus !== "idling"}
                  className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Skip Turn
                </button>
                <button
                  onClick={handleEndGame}
                  className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f]"
                >
                  End Game
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleRollDice}
                disabled={currentPlayer?.uid !== uid || gameState.gameStatus !== "idling"}
                className="h-[58px] w-[230px] rounded-[22px] border-[6px] border-[#ffa23b] bg-[#e84a15] text-lg font-bold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Roll Dice
              </button>
            )}
          </div>

          {isHost ? (
            <div className="mt-8 rounded-2xl bg-[#fff4dc] p-4 shadow-inner">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
                Player Properties
              </p>
              <p className="mt-1 text-sm font-semibold text-[#160f08]">
                Click a player to view their bought properties.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2">
                {gameState.players.map((player) => {
                  const playerProperties = getPlayerOwnedPropertyIds(player);
                  const isSelected = selectedAdminPlayer?.uid === player.uid;

                  return (
                    <button
                      key={player.uid}
                      type="button"
                      onClick={() => setSelectedAdminPlayerUid(player.uid)}
                      className={`flex items-center justify-between rounded-2xl border-[4px] px-4 py-3 text-left font-bold shadow-sm ${
                        isSelected
                          ? "border-[#6b3f1d] bg-[#ffd7a3] text-[#160f08]"
                          : "border-[#ffa23b] bg-[#f5bd78] text-[#6b3f1d] hover:bg-[#ffd7a3]"
                      }`}
                    >
                      <span>{player.username}</span>
                      <span className="rounded-full bg-white/70 px-3 py-1 text-sm">
                        {playerProperties.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border-[4px] border-[#ffa23b] bg-white/60 p-4">
                <p className="text-sm font-extrabold text-[#160f08]">
                  {selectedAdminPlayer?.username ?? "Player"}'s Properties
                </p>

                <div className="mt-3 space-y-3">
                  {selectedAdminPlayerProperties.length > 0 ? (
                    selectedAdminPlayerProperties.map((propertyId) => (
                      <button
                        key={propertyId}
                        type="button"
                        onClick={() =>
                          selectedAdminPlayer &&
                          handleOpenPropertyCard(propertyId, selectedAdminPlayer.uid)
                        }
                        className="w-full rounded-2xl border-[4px] border-[#ffa23b] bg-[#f5bd78] px-4 py-3 text-left font-bold text-[#160f08] shadow-md hover:bg-[#ffd7a3]"
                      >
                        {getPropertyDisplayName(propertyId)}
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl border-[4px] border-dashed border-[#ffa23b] bg-white/50 px-4 py-5 text-center text-sm font-bold text-[#6b3f1d]">
                      This player has no properties yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-[#fff4dc] p-4 shadow-inner">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
                    My Properties
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#160f08]">
                    Money: ${userMoney}
                  </p>
                </div>

                <span className="rounded-full bg-[#f5bd78] px-3 py-1 text-sm font-extrabold text-[#6b3f1d]">
                  {userOwnedPropertyIds.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {userOwnedPropertyIds.length > 0 ? (
                  userOwnedPropertyIds.map((propertyId) => (
                    <button
                      key={propertyId}
                      type="button"
                      onClick={() =>
                        userPlayer && handleOpenPropertyCard(propertyId, userPlayer.uid)
                      }
                      className="w-full rounded-2xl border-[4px] border-[#ffa23b] bg-[#f5bd78] px-4 py-3 text-left font-bold text-[#160f08] shadow-md hover:bg-[#ffd7a3]"
                    >
                      {getPropertyDisplayName(propertyId)}
                    </button>
                  ))
                ) : (
                  <p className="rounded-2xl border-[4px] border-dashed border-[#ffa23b] bg-white/50 px-4 py-5 text-center text-sm font-bold text-[#6b3f1d]">
                    Bought properties will appear here.
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
