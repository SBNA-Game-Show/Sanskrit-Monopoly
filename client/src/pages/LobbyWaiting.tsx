import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

import { GAME_EVENTS } from "../constants/socket/gameEvents";
import type { GameState } from "../types/game/gameTypes";
import { TILE_TYPE_COLORS, PROPERTY_GROUP_COLORS } from "../constants/zim/board";
import { TOKEN_OPTIONS } from "../constants/game/tokenOptions";
import hostImg from "../assets/monopoly_host.png";
import { Button } from "../components/common/Button";

// Define the incoming props from Lobby.tsx
interface LobbyWaitingProps {
  lobbyState: GameState;
  lobbyCode: string;
}

export default function LobbyWaiting({ lobbyState, lobbyCode }: LobbyWaitingProps) {
  const { uid } = useAuth();

  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [startingMoney, setStartingMoney] = useState<number | null>(null);
  const [availableEditions, setAvailableEditions] = useState<{id: string, name: string}[]>([]);

  const host = lobbyState.host;
  const players = lobbyState.players ?? [];
  const isHost = host?.uid === uid;

  // prevent from starting the game if no tokens are selected
  const allPlayersHaveTokens =
    players.length > 0 && players.every((player) => Boolean(player.token));

  const canStart =
    isHost &&
    selectedEdition !== null &&
    startingMoney !== null &&
    players.length > 0 && 
    allPlayersHaveTokens; 

  // Fetch Editions from Firebase
  useEffect(() => {
    const editionsRef = collection(db, "game_editions");

    const unsubscribe = onSnapshot(editionsRef, (snapshot) => { 
      const liveEditions = snapshot.docs.map((doc) => {return {id: doc.id, name: doc.data().name}});
      setAvailableEditions(liveEditions);
    }, (error) => {
      console.log(error);
    });

    return () => unsubscribe();
  }, []);

  // Native Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, tokenId: string) => {
    e.dataTransfer.setData("tokenId", tokenId);
  };

  const handleDropOnPlayer = (e: React.DragEvent, playerUid: string) => {
    e.preventDefault();

    if (!lobbyCode || !uid) return;
    if (playerUid !== uid) return;

    const tokenId = e.dataTransfer.getData("tokenId");
    if (!tokenId) return;

    socket.emit(GAME_EVENTS.PLAYER_UPDATE_TOKEN, {
      lobbyCode,
      uid,
      token: tokenId,
    });
  };

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleStartGame = async () => {
    console.log("STARTING GAME");
    if (!canStart || !lobbyCode || !uid || !selectedEdition) return;

    const docRef = doc(db, "game_editions", selectedEdition);
    const docSnap = await getDoc(docRef);
    const editionData = docSnap.data();

    console.log("EDITION DATA:", editionData);

    const coloredTiles = editionData.tiles.map(tile => ({
      ...tile,
      color: tile.group
        ? PROPERTY_GROUP_COLORS[tile.group] ?? tile.color ?? TILE_TYPE_COLORS[tile.type] ?? "#ffffff"
        : tile.color || TILE_TYPE_COLORS[tile.type] || "#ffffff",
    }));

    const questions = editionData.activities;

    socket.emit(GAME_EVENTS.GAME_START, {
      lobbyCode,
      hostUid: uid,
      tiles: coloredTiles, 
      questions: questions,
      startingPoints: startingMoney ?? 0,
    });
  };

  return (
    <main className="h-[calc(100vh-56px)] overflow-hidden bg-white font-jersey flex flex-col justify-between select-none">
      <style>
        {`
          @keyframes neon-pulse {
            0%, 100% { box-shadow: 0 0 10px #FF9513, 0 0 20px #FF9513; }
            50% { box-shadow: 0 0 25px #FF9513, 0 0 45px #FF9513; }
          }
          .animate-neon {
            animation: neon-pulse 1.8s ease-in-out infinite;
          }
            
            @keyframes token-shake {
              0%, 100% { transform: rotate(0deg); }
              20% { transform: rotate(-10deg); }
              40% { transform: rotate(10deg); }
              60% { transform: rotate(-8deg); }
              80% { transform: rotate(8deg); }
            }
            .dog-token-shake:hover img {
              animation: token-shake 0.35s ease-in-out infinite;
            }

            @keyframes token-jump {
              0%, 100% { transform: translateY(0); }
              40% { transform: translateY(-18px); }
              60% { transform: translateY(-4px); }
            }
            .shoe-token-jump:hover img {
              animation: token-jump 0.45s ease-in-out infinite;
            }

            @keyframes cat-walk {
              0% { transform: translateX(10px) translateY(0) scaleX(1); }
              12% { transform: translateX(6px) translateY(-3px) scaleX(1); }
              25% { transform: translateX(0) translateY(0) scaleX(1); }
              37% { transform: translateX(-6px) translateY(-3px) scaleX(1); }
              50% { transform: translateX(-10px) translateY(0) scaleX(1); }
              62% { transform: translateX(-6px) translateY(-3px) scaleX(-1); }
              75% { transform: translateX(0) translateY(0) scaleX(-1); }
              87% { transform: translateX(6px) translateY(-3px) scaleX(-1); }
              100% { transform: translateX(10px) translateY(0) scaleX(1); }
            }
            .cat-token-walk:hover img {
              animation: cat-walk 1.2s ease-in-out infinite;
            }

            @keyframes boat-rock {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              25% { transform: translateY(-4px) rotate(-6deg); }
              50% { transform: translateY(-2px) rotate(0deg); }
              75% { transform: translateY(-4px) rotate(6deg); }
            }
            .boat-token-rock:hover img {
              animation: boat-rock 1.6s ease-in-out infinite;
              transform-origin: center bottom;
            }
        `}
      </style>

      <div className="w-full max-w-6xl mx-auto px-4 py-2 lg:py-4 grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-center grow min-h-0">
        
        {/* Token Selection Grids */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center space-y-4 w-full h-full">
          <div className="w-full flex flex-col space-y-3 max-w-xl">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {players.map((player) => {
                const playerToken = TOKEN_OPTIONS.find(
                  (token) => token.id === player.token,
                );

                return (
                  <div
                    key={player.uid}
                    className="bg-[#FFC17E] p-2 rounded-2xl flex justify-between items-center shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)] border border-white/20"
                  >
                    <span className="text-2xl lg:text-3xl tracking-wider text-white pl-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                      {player.username}
                    </span>

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnPlayer(e, player.uid)}
                      className="w-12 h-12 lg:w-14 lg:h-12 bg-white rounded-2xl flex items-center shadow-inner mr-1 transition-colors hover:bg-orange-50"
                    >
                      {player.token && playerToken ? (
                        <div
                          draggable={player.uid === uid}
                          onDragStart={(e) => handleDragStart(e, player.token!)}
                          className="w-full h-full bg-white border-4 border-[#FFC17E] rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                        >
                          <img
                            src={playerToken.src}
                            alt={`${player.token} token`}
                            className="h-8 w-8 lg:w-10 object-contain pointer-events-none"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-white rounded-2xl pointer-events-none" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="w-full flex justify-center gap-4 mt-2 p-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnPool}
          >
            {TOKEN_OPTIONS.map((token) => {
              const isPlaced = players.some(
                (player) => player.token === token.id,
              );

              return (
                <div
                  key={token.id}
                  className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center"
                >
                  {!isPlaced ? (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, token.id)}
                      className={`w-full h-full bg-white border-4 border-[#FFC17E] rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform shadow-sm ${
                          token.id === "dog"
                            ? "dog-token-shake"
                            : token.id === "shoe"
                              ? "shoe-token-jump"
                              : token.id === "cat"
                                ? "cat-token-walk"
                                : token.id === "boat"
                                  ? "boat-token-rock"
                                  : "hover:scale-110 transition-transform"
                        }`}
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
          </div>
        </div>

        {/* Game Setting Grid */}
        <div className="lg:col-span-2 bg-[#FFC17E] p-6 lg:p-6 rounded-3xl flex flex-col shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)] w-full h-fit max-h-full overflow-y-auto">
          <h2 className="text-3xl lg:text-4xl text-center mb-8 lg:mb-2 tracking-widest text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            GAME SETTINGS
          </h2>

          <div className="flex flex-col grow space-y-10">
            <div>
              <span className="block text-lg lg:text-xl text-white mb-3 uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                Edition
              </span>

              <div className="flex flex-wrap gap-3 lg:gap-4">
                {availableEditions.map((edition) => {
                    const isSelected = selectedEdition === edition.id;

                    return (
                      <button
                        key={edition.id}
                        disabled={!isHost}
                        onClick={() => setSelectedEdition(edition.id)}
                        className={`text-base lg:text-lg rounded-xl p-2 px-5 tracking-wider transition-all text-white ${
                          isSelected
                            ? "bg-[#FF8C00] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] translate-y-1"
                            : "bg-[#FFA545] border-b-4 border-[#FF8C00] shadow-none hover:bg-[#ffb25c] disabled:opacity-50"
                        }`}
                      >
                        {edition.name}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

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
                          ? "bg-[#FF8C00] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] translate-y-1"
                          : "bg-[#FFA545] border-b-4 border-[#FF8C00] shadow-none hover:bg-[#ffb25c] disabled:opacity-50"
                      }`}
                    >
                      {amount}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="w-[520px] rounded-[18px] bg-[#FF9513] px-8 py-5 text-center shadow-lg">
                <p className="text-[16px] font-bold tracking-normal text-white">
                  Start requires 2 to 4 players.
                </p>
                <p className="mt-2 text-[16px] font-bold tracking-normal text-white">
                  Current players: {players.length}/4
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Start Button Footer */}
      <div className="w-full bg-[#FFC17E] flex justify-center items-center h-20 lg:h-20 shrink-0 z-20">
        <Button size="xl" neon disabled={!canStart} onClick={handleStartGame} className="w-52 bg-[#FF9513] disabled:bg-[#FF8C00]">
          START
        </Button>
      </div>
    </main>
  );
}