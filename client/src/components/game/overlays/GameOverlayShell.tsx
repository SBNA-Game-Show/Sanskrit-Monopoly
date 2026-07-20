type GameOverlayShellProps = {
  children: React.ReactNode;
  status?: "success" | "failure"; //for minigames and quizzes
  size?: "default" | "wide";
};

const statusStyles: Record<"success" | "failure", string> = {
  success: "border-green-500 bg-green-300",
  failure: "border-red-500 bg-red-300",
};

export function GameOverlayShell({
  children,
  status,
  size = "default",
}: GameOverlayShellProps) {
  const colorClasses = status
    ? statusStyles[status]
    : "border-[#ffa23b] bg-[#f5bd78]";

  // Wider overlays let auction views show bidders and property details side-by-side.
  const sizeClass = size === "wide" ? "max-w-[980px]" : "max-w-[560px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6"style={{ animation: "fadeIn 0.3s ease-out forwards" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div
        className={`w-full ${sizeClass} rounded-[28px] border-[8px] p-7 text-center shadow-2xl ${colorClasses}`}
      >
        {children}
      </div>
    </div>
  );
}