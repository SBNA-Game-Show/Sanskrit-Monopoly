type GameOverlayShellProps = {
  children: React.ReactNode;
  status?: "success" | "failure"; //for minigames and quizzes
};

const statusStyles: Record<"success" | "failure", string> = {
  success: "border-green-500 bg-green-300",
  failure: "border-red-500 bg-red-300",
};

export function GameOverlayShell({ children, status }: GameOverlayShellProps) {
  const colorClasses = status
    ? statusStyles[status]
    : "border-[#ffa23b] bg-[#f5bd78]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <div
        className={`w-full max-w-[560px] rounded-[28px] border-[8px] p-7 text-center shadow-2xl ${colorClasses}`}
      >
        {children}
      </div>
    </div>
  );
}