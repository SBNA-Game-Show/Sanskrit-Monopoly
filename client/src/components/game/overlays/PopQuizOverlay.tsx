import type { PlayerState } from "../../../types/game/gameTypes";

type PopQuizOverlayProps = {
  players: PlayerState[];
};

export function PopQuizOverlay({ players }: PopQuizOverlayProps) {
  return (
    <div className="game-overlay">
      <div className="game-overlay__panel">
        <h2>Pop Quiz</h2>
        <p>Quiz overlay placeholder.</p>
        <p>Players participating: {players.length}</p>
      </div>
    </div>
  );
}
