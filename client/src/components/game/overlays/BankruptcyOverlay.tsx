import type { GameState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";
import { socket } from "../../../socket";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";

type BankruptcyOverlayProps = {
  gameState: GameState;
  isHost: boolean;
  uid: string | null;
};

export function BankruptcyOverlay({
  gameState,
  isHost,
  uid,
}: BankruptcyOverlayProps) {
  const bankruptPlayer = gameState.players.find(
    (player) => player.needsBankruptcyResolution && !player.isEliminated,
  );

  if (!bankruptPlayer) return null;

  const handleResolveBankruptcy = (bankruptPlayerUid: string) => {
    if (!gameState.lobbyCode || !uid) return;

    socket.emit(GAME_EVENTS.GAME_RESOLVE_BANKRUPTCY, {
      lobbyCode: gameState.lobbyCode,
      hostUid: uid,
      bankruptPlayerUid,
    });
  };

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

      {isHost ? (
        <button
          type="button"
          onClick={() => handleResolveBankruptcy(bankruptPlayer.uid)}
          className="mt-7 rounded-full bg-[#b33a3a] px-8 py-3 text-base font-extrabold text-white shadow-md hover:bg-[#d9534f]"
        >
          Eliminate Player
        </button>
      ) : (
        <p className="mt-6 text-base font-bold text-[#6b3f1d]">
          Waiting for the host to resolve bankruptcy.
        </p>
      )}
    </GameOverlayShell>
  );
}
