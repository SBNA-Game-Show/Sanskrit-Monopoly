type GameOverlayShellProps = {
  children: React.ReactNode;
};

export function GameOverlayShell({ children }: GameOverlayShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 text-center shadow-lg">
        {children}
      </div>
    </div>
  );
}
