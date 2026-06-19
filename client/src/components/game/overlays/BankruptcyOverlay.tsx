import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";
import { socket } from "../../../socket";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";

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
          {bankruptPlayer.money < 0
            ? `-₩${Math.abs(bankruptPlayer.money)}`
            : `₩${bankruptPlayer.money}`}
        </span>
        .
      </p>

      {/* Render exactly one role-specific action or waiting message. */}
      {renderActionContent()}
    </GameOverlayShell>
  );
}