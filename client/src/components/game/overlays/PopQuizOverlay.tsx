import type { ActiveQuiz, PlayerState } from "../../../types/game/gameTypes";
import { GameOverlayShell } from "./GameOverlayShell";
import { useEffect, useState } from "react";

type PopQuizOverlayProps = {
  quiz: ActiveQuiz;
  players: PlayerState[];
  isHost: boolean;
  onSubmitAnswer: (optionId: string) => void;
};

export function PopQuizOverlay({
  quiz,
  players,
  isHost,
  onSubmitAnswer,
}: PopQuizOverlayProps) {
  // used to display the remaining time left for quiz popup
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(intervalId);
  }, []);

  const remainingMs =
    typeof quiz.endsAt === "number" ? Math.max(0, quiz.endsAt - now) : 0;

  const remainingSeconds = Math.ceil(remainingMs / 1000);

  const handleAnswerClick = (optionId: string) => {
    if (isHost) {
      return;
    }

    onSubmitAnswer(optionId);
  };

  console.log("quiz.endsAt:", quiz.endsAt, typeof quiz.endsAt);
  console.log("quiz:", quiz);
  return (
    <GameOverlayShell>
      <h2 className="text-2xl font-bold text-gray-800">Pop Quiz</h2>
      <p className="mt-3 text-gray-700">{quiz.question}</p>
      <p className="mt-3 text-sm font-medium text-gray-600">
        Time remaining: {remainingSeconds}s
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {quiz.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={isHost}
            onClick={() => handleAnswerClick(option.id)}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-100"
          >
            {option.text}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Answers submitted: {Object.keys(quiz.answers).length} / {players.length}
      </p>
    </GameOverlayShell>
  );
}
