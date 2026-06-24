import type { GameState, ActiveQuiz } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";
import { useEffect, useState } from "react";
import { socket } from "../../../socket";
import { GAME_EVENTS } from "../../../constants/socket/gameEvents";

type PopQuizOverlayProps = {
  gameState: GameState;
  quiz: ActiveQuiz;
  isHost: boolean;
  lobbyCode: string;
  uid: string | null;
};

export function PopQuizOverlay({
  gameState,
  quiz,
  isHost,
  lobbyCode,
  uid,
}: PopQuizOverlayProps) {
  const [now, setNow] = useState(Date.now());

  const isCurrentPlayer = uid === gameState.players[gameState.currentPlayerIndex].uid;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(intervalId);
  }, []);

  const remainingMs =
    typeof quiz.endsAt === "number" ? Math.max(0, quiz.endsAt - now) : 0;

  const remainingSeconds = Math.ceil(remainingMs / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");
  const displayTime = `${pad(Math.floor(remainingSeconds / 60))}:${pad(remainingSeconds % 60)}`;

  const handleSubmitAnswer = (answer: string) => {
    if (isHost || !uid) return;

    socket.emit(GAME_EVENTS.QUIZ_SUBMIT_ANSWER, {
      lobbyCode,
      uid,
      answer,
    });
  };

  if (quiz.status === "correct") {
    return (
      <GameOverlayShell>
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
          Correct Answer!
        </p>
        <h2 className="text-[34px] font-extrabold text-[#160f08]">Pop Quiz</h2>
        <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
          You answered correctly!
        </p>
      </GameOverlayShell>
    );
  }

  if (quiz.status === "incorrect") {
    return (
      <GameOverlayShell>
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
          Incorrect Answer!
        </p>
        <h2 className="text-[34px] font-extrabold text-[#160f08]">Pop Quiz</h2>
        <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
          You answered incorrectly!
        </p>
      </GameOverlayShell>
    );
  }

  if (quiz.status === "timerExpired") {
    return (
      <GameOverlayShell>
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
          Time's Up!
        </p>
        <h2 className="text-[34px] font-extrabold text-[#160f08]">Pop Quiz</h2>
        <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
          Time expired! You didn't answer in time.
        </p>
      </GameOverlayShell>
    );
  }

  return (
    <GameOverlayShell>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#b33a3a]">
        Penalty Activity
      </p>

      <h2 className="text-[34px] font-extrabold text-[#160f08]">Pop Quiz</h2>

      <div className="mx-auto mt-5 flex h-[48px] w-[120px] items-center justify-center rounded-full bg-[#e84a15] text-lg font-extrabold text-white shadow-md">
        {displayTime}
      </div>

      <div className="mt-5 rounded-2xl bg-[#fff4dc] p-5 text-left shadow-inner">
        <p className="text-sm font-extrabold uppercase text-[#6b3f1d]">
          Question
        </p>
        <p className="mt-2 text-[22px] font-bold text-[#160f08]">
          {quiz.question}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            type="button"
            disabled={isHost || !isCurrentPlayer}
            onClick={() => handleSubmitAnswer(option)}
            className={`rounded-2xl border-[5px] border-[#ffa23b] px-4 py-4 text-lg font-bold shadow-md transition ${
              !isHost && isCurrentPlayer
                ? "bg-[#e84a15] text-white hover:bg-[#ff7a2f]"
                : "cursor-not-allowed bg-[#fff4dc] text-[#6b3f1d] opacity-70"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {(isHost || !isCurrentPlayer) && (
        <p className="mt-5 text-sm font-semibold text-[#6b3f1d]">
          You can see the question, but only the current player can answer.
        </p>
      )}
    </GameOverlayShell>
  );
}
