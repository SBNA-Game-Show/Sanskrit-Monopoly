import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";

interface ActiveLobby {
    code: string;
    host: string;
    players: number;
    maxPlayers: number;
    edition: string;
}

export default function ActiveLobbies() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [lobbies, setLobbies] = useState<ActiveLobby[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLobbies = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/lobbies");
                if (!response.ok) throw new Error("Failed to fetch lobbies");

                const data = await response.json();
                setLobbies(data.lobbies || []);
            } catch (error) {
                console.error("Error fetching lobbies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLobbies();
        const interval = setInterval(fetchLobbies, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Full Lobby Check
    const handleJoin = (lobby: ActiveLobby) => {
        if (lobby.players >= lobby.maxPlayers) {
            showToast({
                variant: "error",
                title: "Lobby Full",
                message: "This lobby is already full."
            });
            return;
        }
        navigate(`/lobby/${lobby.code}`);
    };

    // Button Styling
    const shared_styles = {
        btnTransition: "transition-all duration-300 active:scale-95 cursor-pointer shadow-sm border-none select-none outline-none",
        textFormat: "tracking-widest font-normal font-jersey text-white text-center"
    };

    const availableLobbies = lobbies.filter(lobby => lobby.players < lobby.maxPlayers);
    
    return (
    <main className="h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-start select-none relative overflow-hidden">
      
      {/* Centered Grid Workspace */}
      <div className="w-full max-w-6xl mx-auto px-6 py-16 flex-grow flex flex-col items-center">
        
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-4xl font-jersey text-[#FDAF5D] tracking-widest animate-pulse">SCANNING FOR GAMES...</p>
          </div>
        ) : availableLobbies.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-4xl font-jersey text-[#FDAF5D] tracking-widest">NO ACTIVE LOBBIES FOUND.</p>
          </div>
        ) : (
          /* Grid Layout For Lobby Codes */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-16 overflow-y-auto p-4">
            {availableLobbies.map((lobby) => (
              <div key={lobby.code} className="flex flex-col items-center gap-2">
                <button 
                  key={lobby.code}
                  onClick={() => handleJoin(lobby)}
                  className={`bg-[#FDAF5D] hover:bg-[#FF9513] h-16 w-52 rounded-[30px] text-3xl ${shared_styles.textFormat} ${shared_styles.btnTransition}`}
                >
                  {lobby.code}
                </button>

                {/* Player Count Text */}
                <span className="text-[#FDAF5D] font-jersey text-[1.35rem] tracking-widest uppercase">
                  PLAYERS: {lobby.players}/{lobby.maxPlayers}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer W/ Back To Home Btn */}
      <div className="w-full bg-[#FFC17E] flex justify-center items-center h-20 lg:h-20 shrink-0 shadow-[0px_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <button
          onClick={() => navigate("/home")}
          className="px-10 h-[50px] lg:h-[50px] rounded-2xl text-2xl lg:text-3xl font-jersey tracking-widest text-white transition-all duration-300 border-none bg-[#FF9513] hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
        >
          BACK TO HOME
        </button>
      </div>
      
    </main>
  );
}