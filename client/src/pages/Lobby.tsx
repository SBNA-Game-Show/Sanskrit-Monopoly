import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

import AdminGame from "./AdminGame";
import Game from "./Game";

import boatImg from "../assets/monopoly_boat.png";
import catImg from "../assets/monopoly_cat.png";
import shoeImg from "../assets/monopoly_shoe.png";
import dogImg from "../assets/monopoly_dog.png";
import hostImg from "../assets/monopoly_host.png";

export default function Lobby() {
  const [lobbyState, setLobbyState] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [startingMoney, setStartingMoney] = useState<number | null>(null);

  const { lobbyCode } = useParams<string>();
  const { uid, username, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    socket.emit("lobby-join", { lobbyCode, uid, username });

    socket.on("lobby-update", (lobby) => {
      setLobbyState(lobby);
    });

    socket.on("error", (err) => console.log(err));

    return () => {
      socket.removeAllListeners();
    };
  }, [authLoading]);

  const host = lobbyState?.host;
  const players = lobbyState?.players || [];

  // Native React Drop & Drag State
  const availableTokens = [
    { id: "boat", src: boatImg },
    { id: "cat", src: catImg },
    { id: "shoe", src: shoeImg },
    { id: "dog", src: dogImg },
  ];

  // Track which token is assigned to which player
  const [playerTokens, setPlayerTokens] = useState<(string | null)[]>([null, null, null, null]);

  const isHost = host?.uid === uid;
  const canStart = isHost && selectedEdition !== null && startingMoney !== null && players.length === 4;

  // Native Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, tokenId: string) => {
    e.dataTransfer.setData("tokenId", tokenId);
  };

  const handleDropOnPlayer = (e: React.DragEvent, playerIndex: number) => {
    e.preventDefault();
    const tokenId = e.dataTransfer.getData("tokenId");
    if (!tokenId) return;

    setPlayerTokens((prev) => {
      const newTokens = [...prev];
      const existingIndex = newTokens.indexOf(tokenId);
      if (existingIndex !== -1) newTokens[existingIndex] = null; // Unassign from previous player
      newTokens[playerIndex] = tokenId; // Assign to new player
      return newTokens;
    });
  };

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    const tokenId = e.dataTransfer.getData("tokenId");
    if (!tokenId) return;

    setPlayerTokens((prev) => {
      const newTokens = [...prev];
      const existingIndex = newTokens.indexOf(tokenId);
      if (existingIndex !== -1) newTokens[existingIndex] = null; // Unassign from player
      return newTokens;
    });
  };

  const handleStartGame = () => {
    if (canStart) {
      socket.emit("game-start", { lobbyCode });
    }
  };

  if (lobbyState && lobbyState.status === "waiting") {
    return (
      <main className="h-[calc(100vh-56px)] overflow-hidden bg-white font-jersey flex flex-col justify-between select-none">
        
        {/* Inline style for pulsing glow effect on Start Button */}
        <style>
          {`
            @keyframes neon-pulse {
              0%, 100% { box-shadow: 0 0 10px #FF9513, 0 0 20px #FF9513; }
              50% { box-shadow: 0 0 25px #FF9513, 0 0 45px #FF9513; }
            }
            .animate-neon {
              animation: neon-pulse 1.8s ease-in-out infinite;
            }
          `}
        </style>

        <div className="w-full max-w-6xl mx-auto px-4 py-2 lg:py-4 grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-center flex-grow min-h-0">
          
          {/* Player Registration Grid */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center space-y-4 w-full h-full">
            <div className="w-full flex flex-col space-y-3 max-w-xl">
              
              {/* Centered Host Box */}
              <div className="flex justify-center w-full">
                <div className="w-full sm:w-[calc(50%-0.5rem)] bg-[#FFC17E] p-2 rounded-2xl flex justify-between items-center shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)] border border-white/20">
                  <span className="text-2xl lg:text-3xl tracking-wider text-white pl-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                    {host?.username}
                  </span>

                  <div className="w-12 h-12 lg:w-14 lg:h-12 bg-white rounded-2xl flex items-center justify-center p-1 shadow-inner overflow-hidden mr-1 border border-orange-200">
                    <img
                      src={hostImg}
                      alt="Host"
                      className="w-full h-full object-contain"
                      draggable="false"
                    />
                  </div>
                </div>
              </div>
              
              {/* Generic Player Grid w/ Drop Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {players.map((p, index) => (
                  <div
                    key={p.uid}
                    className="bg-[#FFC17E] p-2 rounded-2xl flex justify-between items-center shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)] border border-white/20"
                  >
                    <span className="text-2xl lg:text-3xl tracking-wider text-white pl-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                      {p.username}
                    </span>

                    {/* Drop Zone for Player */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnPlayer(e, index)}
                      className="w-12 h-12 lg:w-14 lg:h-12 bg-white rounded-2xl flex items-center shadow-inner mr-1 transition-colors hover:bg-orange-50"
                    >
                      {playerTokens[index] ? (
                        <div
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, playerTokens[index]!)
                          }
                          className="w-full h-full bg-white border-4 border-[#FFC17E] rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                        >
                          <img
                            src={
                              availableTokens.find(
                                (t) => t.id === playerTokens[index],
                              )?.src
                            }
                            alt="token"
                            className="h-8 w-8 lg:w-10 object-contain pointer-events-none"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-white rounded-2xl pointer-events-none" />
                      )}
                    </div>
                  </div>
                ))}
              </div> {/* Generic Player Grid w/ Drop Zones */}
            </div> {/* Player Registration Grid */}
            
            {/* Token Pool (Bottom Boxes) */}
            <div
              className="w-full flex justify-center gap-4 mt-2 p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnPool}
            >
              {availableTokens.map((token) => {
                const isPlaced = playerTokens.includes(token.id);

                return (
                  <div
                    key={token.id}
                    className="w-16 h-16 lg:w-20 lg:h-20 glex items-center justify-center"
                  >
                    {!isPlaced ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, token.id)}
                        className="w-full h-full bg-white border-4 border-[#FFC17E] rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform shadow-sm"
                      >
                        <img
                          src={token.src}
                          alt={token.id}
                          className="h-10 w-10 lg:w-12 lg:h-12 object-contain pointer-events-none"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full border-4 border-[#FFC17E] rounded-2xl opacity-30 border-dashed" />
                    )}
                  </div>
                );
              })}
            </div>{/* Token Pool (Bottom Boxes) */}
          </div>

          {/* Game Setting Grid*/}
          <div className="lg:col-span-2 bg-[#FFC17E] p-6 lg:p-6 rounded-3xl flex flex-col shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)] w-full h-full max-h-none lg:max-h-[400px]">
            <h2 className="text-3xl lg:text-4xl text-center mb-8 lg:mb-2 tracking-widest text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              GAME SETTINGS
            </h2>

            <div className="flex flex-col flex-grow space-y-10">
              {/* EDITION SELECTOR */}
              <div>
                <span className="block text-lg lg:text-xl text-white mb-3 uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                  Edition
                </span>
                <div className="flex flex-wrap gap-3 lg:gap-4">
                  {["TEMPLE", "MORAL TEACHING", "BHAGAVAD GITA", "HISTORY"].map(
                    (edition) => {
                      const isSelected = selectedEdition === edition;
                      return (
                        <button
                          key={edition}
                          disabled={!isHost}
                          onClick={() => setSelectedEdition(edition)}
                          className={`text-base lg:text-lg rounded-xl p-2 px-5 tracking-wider transition-all text-white ${
                            isSelected
                              ? "bg-[#FF8C00] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] translate-y-[4px]"
                              : "bg-[#FFA545] border-b-4 border-[#FF8C00] shadow-none hover:bg-[#ffb25c] disabled:opacity-50"
                          }`}
                        >
                          {edition}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
              
              {/* Currency Selector */}
              <div>
                <span className="block text-lg lg:text-xl text-white mb-3 uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                  Starting Money
                </span>

                <div className="flex gap-4 lg:gap-5">
                  {[500, 1000, 1500].map((amount) => {
                    const isSelected = startingMoney === amount;
                    return (
                      <button
                        key={amount}
                        disabled={!isHost}
                        onClick={() => setStartingMoney(amount)}
                        className={`flex-1 text-base lg:text-lg rounded-xl p-2 tracking-wider transition-all text-white ${
                          isSelected
                            ? "bg-[#FF8C00] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] translate-y-[4px]"
                            : "bg-[#FFA545] border-b-4 border-[#FF8C00] shadow-none hover:bg-[#ffb25c] disabled:opacity-50"
                        }`}
                      >
                        {amount}
                      </button>
                    );
                  })}
                </div>
              </div>{/* Currency Selector */}
            </div>
          </div>
        </div>{/* Main Content Grid */}

        {/* Footer w/ Start Button */}
        <div className="w-full bg-[#FFC17E] flex justify-center items-center h-20 lg:h-20 shrink-0 z-20">
          <button
            disabled={!canStart}
            onClick={handleStartGame}
            className={`
              w-[220px] h-[50px] lg:w-[220px] lg:h-[50px] rounded-2xl text-2xl lg:text-3xl font-jersey tracking-widest text-white transition-all duration-300 relative bottom-0 border-none
              ${canStart 
                ? "bg-[#FF9513] animate-neon hover:bg-[#FFA545] hover:scale-105 active:scale-95 active:shadow-none" 
                : "bg-[#FF8C00] opacity-60 cursor-not-allowed"
              }
            `}
          >
            START
          </button>
        </div>
      </main>
    );
  }

  if (lobbyState && lobbyState.status === "playing" && host.socketId === socket.id) {
    return <AdminGame gameState={lobbyState}/>
  }

  if (lobbyState && lobbyState.status === "playing" && host.socketId !== socket.id) {
    return <Game gameState={lobbyState}/>
  }
} 
