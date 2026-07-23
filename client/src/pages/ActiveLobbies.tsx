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

    const SERVER_URL = import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://sanskrit-monopoly.onrender.com";

    useEffect(() => {
        const fetchLobbies = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/api/lobbies`);
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
      <div className="w-full max-w-6xl mx-auto px-3 py-8 flex-grow flex flex-col items-center min-h-0">
        
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
          <div className="w-full flex flex-col gap-10 overflow-y-auto px-2 py-4 h-full">
            {availableLobbies.map((lobby) => (
              <div key={lobby.code} className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full items-center text-center text-[#FDAF5D] text-2xl lg:text-[1.5rem] font-jersey tracking-widest uppercase">
                <span>HOST: {lobby.host}</span>
                <span>EDITION: {lobby.edition}</span>
                <span>PLAYERS: {lobby.players}/{lobby.maxPlayers}</span>
                
                <div className="flex justify-center">
                  <button 
                    onClick={() => handleJoin(lobby)}
                    className={`bg-[#FDAF5D] hover:bg-[#FF9513] h-12 w-43 rounded-[30px] text-3xl ${shared_styles.textFormat} ${shared_styles.btnTransition}`}>
                    {lobby.code}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer W/ Back To Home Btn */}
      <div className="w-full bg-[#FFC17E] flex justify-center items-center h-16 lg:h-16 shrink-0 shadow-[0px_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <button
          onClick={() => navigate("/home")}
          className="px-10 h-[50px] lg:h-[50px] rounded-[30px] text-2xl lg:text-3xl font-jersey tracking-widest text-white transition-all duration-300 border-none bg-[#FF9513] hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
        >
          BACK TO HOME
        </button>
      </div>
      
    </main>
  );
}