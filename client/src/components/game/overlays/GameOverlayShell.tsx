type GameOverlayShellProps = {
  children: React.ReactNode;
};

export function GameOverlayShell({ children }: GameOverlayShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <div className="w-full max-w-[560px] rounded-[28px] border-[8px] border-[#ffa23b] bg-[#f5bd78] p-7 text-center shadow-2xl">
        {children}
      </div>
    </div>
  );
}
