import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNav } from "./game/TransitionOverlay";

function Navbar() {
  const { uid, username, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNav();

  const handleLogout = async () => {
    if (!auth) return;

    navigate(() => {
      signOut(auth)
        .then(() => {
          showToast({
            variant: "success",
            title: "Logged out",
            message: "You have been logged out successfully.",
          });
        })
        .catch(() => {
          showToast({
            variant: "error",
            title: "Logout failed",
            message: "Could not log out. Please try again.",
          });
        });
    });
  };

  // Dynamic Header
  const path = window.location.pathname;
  const isLobbyPage = path.includes("/lobby/");

  // If on lobby page then get code from URL
  const lobbyCodeStr = isLobbyPage
    ? path.split("/lobby/")[1]?.toUpperCase()
    : "";
  const displayTitle = isLobbyPage
    ? `GAME CODE: ${lobbyCodeStr}`
    : "Sanskrit Monopoly";

  const handleCopyCode = async () => {
    if (!isLobbyPage || !lobbyCodeStr) return;

    try {
      await navigator.clipboard.writeText(lobbyCodeStr);
      showToast({
        variant: "success",
        title: "Code Copied!",
        message: `Game code ${lobbyCodeStr} copied to clipboard. Share it with your friends!`,
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Copy Failed",
        message: "Failed to copy the game code. Please try again.",
      });
    }
  };

  return (
    <header className="flex min-h-16 items-center justify-between bg-[#FFC17E] px-6 py-2 select-none font-jersey relative shadow-sm">
      {/* Pulsing Effect for Game Code */}
      <style>
        {`
          @keyframes text-glow-pulse {
            0%, 100% { text-shadow: 0 0 5px #F97316, 0 0 10px #F97316; }
            50% { text-shadow: 0 0 10px #F97316, 0 0 20px #F97316, 0 0 30px #F97316; }
          }
          .animate-text-glow {
            animation: text-glow-pulse 2.4s ease-in-out infinite;
          }
        `}
      </style>

      <div className="flex items-center">
        <div className="bg-[#FFA545] border-2 border-white rounded-xl text-white text-xl px-4 py-0.5 tracking-wider shadow-sm cursor-default">
          Logo
        </div>
      </div>

      {/* Clickable Code */}
      <div
        onClick={isLobbyPage ? handleCopyCode : undefined}
        title={isLobbyPage ? "Click to copy game code" : undefined}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-300 
        ${isLobbyPage ? "cursor-pointer hover:scale-110 active:scale-95" : "pointer-events-none"}`}
      >
        <h1
          className={`text-3xl lg:text-4xl text-white tracking-widest m-0 uppercase font-normal transition-all duration-300 
          ${isLobbyPage ? "animate-text-glow" : "drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"}`}
        >
          {displayTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {uid && (
          <div className="flex flex-col items-end justify-center font-sans">
            <p className="m-0 text-sm font-semibold text-slate-700">
              {username || "Unknown user"} · {isAdmin ? "Admin" : "Player"}
            </p>
            <p className="m-0 mt-0.5 text-[0.7rem] text-slate-400">
              UID: {uid}
            </p>
          </div>
        )}

        {uid && (
          <button
            type="button"
            onClick={handleLogout}
            className="btn-primary font-sans"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
