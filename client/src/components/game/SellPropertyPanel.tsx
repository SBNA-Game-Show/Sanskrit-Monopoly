import { useState } from "react";
import type { GameState } from "../../types/game/gameTypes";
import { GAME_EVENTS } from "../../constants/socket/gameEvents";
import { socket } from "../../socket";
import { formatMoney } from "../../utils/gameMoney";
import { getPlayerProperties } from "../../utils/gameTiles";
import { getSellValue } from "../../utils/gameTiles";


type SellPropertyPanelProps = {
  gameState: GameState;
  uid: string | null;
};

export function SellPropertyPanel({ gameState, uid }: SellPropertyPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const userPlayer =
    gameState.players.find((player) => player.uid === uid) ?? null;

  const userProperties = getPlayerProperties(gameState, userPlayer);

  const isUserTurn =
    Boolean(uid) &&
    currentPlayer?.uid === uid &&
    gameState.gameStatus === "idling";

  const hasProperties = userProperties.length > 0;

  const handleSellProperty = (propertyId: string) => {
    if (!gameState.lobbyCode || !uid || !isUserTurn) return;

    socket.emit(GAME_EVENTS.GAME_SELL_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
      propertyId,
    });
  };

  return (
    <div className="mt-6 rounded-2xl bg-[#fff4dc] p-4 shadow-inner">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
            Sell Property
          </p>

          <p className="mt-1 text-sm font-semibold text-[#160f08]">
            Money: {formatMoney(userPlayer?.money ?? 0)}
          </p>
        </div>

        <span className="rounded-full bg-[#f5bd78] px-3 py-1 text-sm font-extrabold text-[#6b3f1d]">
          {userProperties.length}
        </span>
      </div>

      <button
        type="button"
        disabled={!hasProperties}
        onClick={() => setIsOpen((current) => !current)}
        className="mt-4 h-[48px] w-full rounded-2xl border-[5px] border-[#ffa23b] bg-[#e84a15] text-base font-extrabold text-white shadow-md hover:bg-[#ff7a2f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOpen ? "Hide Properties" : "Sell My Properties"}
      </button>

      {!isUserTurn && (
        <p className="mt-3 rounded-xl bg-[#fff1e5] px-3 py-2 text-center text-xs font-bold text-[#6b3f1d]">
          You can only sell during your turn.
        </p>
      )}

      {isOpen && (
        <div className="mt-4 space-y-3">
          {hasProperties ? (
            userProperties.map((property) => {
              const sellValue = getSellValue(property);

              return (
                <div
                  key={property.id}
                  className="rounded-2xl border-[4px] border-[#ffa23b] bg-[#f5bd78] p-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-extrabold text-[#160f08]">
                        {property.name}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#6b3f1d]">
                        Sell value: {formatMoney(sellValue)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!isUserTurn}
                      onClick={() => handleSellProperty(property.id)}
                      className="rounded-xl bg-[#b33a3a] px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-[#c84a4a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-2xl border-[4px] border-dashed border-[#ffa23b] bg-white/50 px-4 py-5 text-center text-sm font-bold text-[#6b3f1d]">
              You have no properties to sell yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}