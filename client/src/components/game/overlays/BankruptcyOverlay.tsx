import type { GameState, GameTile } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";
import { socket } from "../../../socket";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";
import { formatMoney } from "../../../utils/gameMoney";
import { getSellValue } from "../../../utils/gameTiles";

type BankruptcyOverlayProps = {
  gameState: GameState;
  isHost: boolean;
  uid: string | null;
};

type BankruptcyViewerRole = "bankruptPlayer" | "host" | "observer";

export function BankruptcyOverlay({
  gameState,
  isHost,
  uid,
}: BankruptcyOverlayProps) {
  const bankruptPlayer = gameState.players.find(
    (player) => player.isBankrupt && !player.isEliminated,
  );

  if (!bankruptPlayer) return null;

  // avoids "possibly undefined" warnings
  const activeBankruptPlayer = bankruptPlayer;

  // decide what this viewer is allowed to do in bankruptcy overlay
  const viewerRole: BankruptcyViewerRole =
    activeBankruptPlayer.uid === uid
      ? "bankruptPlayer"
      : isHost
        ? "host"
        : "observer";

  const bankruptPlayerProperties = activeBankruptPlayer.properties
    .map((propertyId) =>
      gameState.edition.tiles.find((tile) => tile.id === propertyId),
    )
    .filter((tile): tile is GameTile => Boolean(tile));

  const totalSellValue = bankruptPlayerProperties.reduce(
    (total, property) => total + getSellValue(property),
    0,
  );

  function handleSellProperty(propertyId: string) {
    if (!gameState.lobbyCode || !uid || viewerRole !== "bankruptPlayer") {
      return;
    }

    // The server decides whether this sale fully resolves bankruptcy.
    socket.emit(GAME_EVENTS.GAME_SELL_PROPERTY, {
      lobbyCode: gameState.lobbyCode,
      uid,
      propertyId,
    });
  }

  function handleBankruptcyResolution() {
    if (!gameState.lobbyCode || !uid) return;

    if (viewerRole === "bankruptPlayer") {
      // bankrupt player is declaring bankruptcy for themselves
      socket.emit(GAME_EVENTS.GAME_DECLARE_BANKRUPTCY, {
        lobbyCode: gameState.lobbyCode,
        uid,
      });

      return;
    }

    if (viewerRole === "host") {
      // host can still force-eliminate as a fallback
      socket.emit(GAME_EVENTS.GAME_RESOLVE_BANKRUPTCY, {
        lobbyCode: gameState.lobbyCode,
        hostUid: uid,
        bankruptPlayerUid: activeBankruptPlayer.uid,
      });
    }
  }

  function renderActionContent() {
    switch (viewerRole) {
      case "bankruptPlayer":
        return (
          <>
            <div className="mt-6 rounded-2xl border-[4px] border-[#ffa23b] bg-[#fff1e5] p-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
                    Sell Properties
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#6b3f1d]">
                    Total sell value: {formatMoney(totalSellValue)}
                  </p>
                </div>

                <span className="rounded-full bg-[#f5bd78] px-3 py-1 text-sm font-extrabold text-[#6b3f1d]">
                  {bankruptPlayerProperties.length}
                </span>
              </div>

              <div className="mt-4 max-h-[220px] space-y-3 overflow-y-auto pr-1">
                {bankruptPlayerProperties.length > 0 ? (
                  bankruptPlayerProperties.map((property) => (
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
                            Sell value: {formatMoney(getSellValue(property))}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSellProperty(property.id)}
                          className="rounded-xl bg-[#b33a3a] px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-[#c84a4a]"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border-[4px] border-dashed border-[#ffa23b] bg-white/50 px-4 py-5 text-center text-sm font-bold text-[#6b3f1d]">
                    No properties left to sell.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleBankruptcyResolution}
              className="mt-7 rounded-full bg-[#b33a3a] px-8 py-3 text-base font-extrabold text-white shadow-md hover:bg-[#d9534f]"
            >
              Declare Bankruptcy
            </button>
          </>
        );

      case "host":
        return (
          <>
            {/* bankrupt player should normally resolve this on their own */}
            <p className="mt-6 text-base font-bold text-[#6b3f1d]">
              Waiting for {activeBankruptPlayer.username} to resolve bankruptcy.
            </p>

            <button
              type="button"
              onClick={handleBankruptcyResolution}
              className="mt-7 rounded-full bg-[#b33a3a] px-8 py-3 text-base font-extrabold text-white shadow-md hover:bg-[#d9534f]"
            >
              Force Eliminate Player
            </button>
          </>
        );

      default:
        return (
          // Other players just get to sit and look pretty in the meanwhile
          <p className="mt-6 text-base font-bold text-[#6b3f1d]">
            Waiting for {activeBankruptPlayer.username} to resolve bankruptcy.
          </p>
        );
    }
  }

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#6b3f1d]">
        Bankruptcy Pending
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">
        {bankruptPlayer.username}
      </h2>

      <p className="mt-4 text-lg font-semibold text-[#6b3f1d]">
        This player is below ₩0 with a balance of{" "}
        <span className="font-extrabold">
          {formatMoney(bankruptPlayer.money)}
        </span>
        .
      </p>

      {/* Render exactly one role-specific action or waiting message. */}
      {renderActionContent()}
    </GameOverlayShell>
  );
}
