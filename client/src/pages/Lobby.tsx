import { useEffect, useState, type DragEvent } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";
import type { LobbyPlayer, LobbyState } from "../types/game";

import AdminGame from "./AdminGame";
import Game from "./Game";

import boatImg from "../assets/monopoly_boat.png";
import catImg from "../assets/monopoly_cat.png";
import shoeImg from "../assets/monopoly_shoe.png";
import dogImg from "../assets/monopoly_dog.png";
import hostImg from "../assets/monopoly_host.png";

type Token = {
  id: string;
  src: string;
};

const availableTokens: Token[] = [
  { id: "boat", src: boatImg },
  { id: "cat", src: catImg },
  { id: "shoe", src: shoeImg },
  { id: "dog", src: dogImg },
];

export default function Lobby() {
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [startingMoney, setStartingMoney] = useState<number | null>(null);
  const [playerTokens, setPlayerTokens] = useState<(string | null)[]>([null, null, null, null]);

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { uid, username, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !lobbyCode) return;

    socket.emit("lobby-join", { lobbyCode, uid, username });

    const handleLobbyUpdate = (lobby: LobbyState) => {
      setLobbyState(lobby);
    };

    const handleErrorMessage = (message: string) => {
      alert(message);
    };

    socket.on("lobby-update", handleLobbyUpdate);
    socket.on("error-message", handleErrorMessage);

    return () => {
      socket.off("lobby-update", handleLobbyUpdate);
      socket.off("error-message", handleErrorMessage);
    };
  }, [authLoading, lobbyCode, uid, username]);

  const host = lobbyState?.host;
  const players = lobbyState?.players || [];
  const isHost = host?.uid === uid || host?.socketId === socket.id;
  const canStart = Boolean(
    isHost &&
      selectedEdition &&
      startingMoney &&
      players.length >= 2 &&
      players.length <= 4
  );

  function handleDragStart(event: DragEvent<HTMLDivElement>, tokenId: string) {
    event.dataTransfer.setData("tokenId", tokenId);
  }

  function handleDropOnPlayer(event: DragEvent<HTMLDivElement>, playerIndex: number) {
    event.preventDefault();
    const tokenId = event.dataTransfer.getData("tokenId");
    if (!tokenId) return;

    setPlayerTokens((previousTokens) => {
      const updatedTokens = [...previousTokens];
      const existingIndex = updatedTokens.indexOf(tokenId);

      if (existingIndex !== -1) {
        updatedTokens[existingIndex] = null;
      }

      updatedTokens[playerIndex] = tokenId;
      return updatedTokens;
    });
  }

  function handleDropOnPool(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const tokenId = event.dataTransfer.getData("tokenId");
    if (!tokenId) return;

    setPlayerTokens((previousTokens) => {
      const updatedTokens = [...previousTokens];
      const existingIndex = updatedTokens.indexOf(tokenId);

      if (existingIndex !== -1) {
        updatedTokens[existingIndex] = null;
      }

      return updatedTokens;
    });
  }

  function handleStartGame() {
    if (!canStart) return;

    socket.emit("game-start", {
      lobbyCode,
      selectedEdition,
      startingMoney,
      playerTokens,
    });
  }

  if (!lobbyState) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white font-jersey">
        <p className="text-3xl text-[#FF9513]">Loading lobby...</p>
      </main>
    );
  }

  if (lobbyState.status === "playing") {
    const isCurrentUserHost = lobbyState.host?.socketId === socket.id || lobbyState.host?.uid === uid;
    return isCurrentUserHost ? <AdminGame gameState={lobbyState} /> : <Game gameState={lobbyState} />;
  }

  return (
    <main className="flex h-screen select-none flex-col justify-between overflow-hidden bg-white font-jersey">
      <style>
        {`
          @keyframes neon-pulse {
            0%, 100% { box-shadow: 0 0 10px #FF9513, 0 0 20px #FF9513; }
            50% { box-shadow: 0 0 25px #FF9513, 0 0 45px #FF9513; }
          }
          .animate-neon { animation: neon-pulse 1.8s ease-in-out infinite; }
        `}
      </style>

      <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-grow grid-cols-1 items-center gap-4 px-4 py-4 lg:grid-cols-5 lg:gap-6">
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 lg:col-span-3">
          <div className="flex w-full max-w-xl flex-col space-y-3">
            <div className="flex w-full justify-center">
              <div className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-[#FFC17E] p-2 shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)] sm:w-[calc(50%-0.5rem)]">
                <span className="pl-4 text-2xl tracking-wider text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] lg:text-3xl">
                  {host?.username || "Host"}
                </span>

                <div className="mr-1 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-orange-200 bg-white p-1 shadow-inner lg:h-12 lg:w-14">
                  <img src={hostImg} alt="Host" className="h-full w-full object-contain" draggable="false" />
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {players.map((player: LobbyPlayer, index: number) => (
                <div
                  key={player.uid || player.socketId || index}
                  className="flex items-center justify-between rounded-2xl border border-white/20 bg-[#FFC17E] p-2 shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)]"
                >
                  <span className="pl-4 text-2xl tracking-wider text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] lg:text-3xl">
                    {player.username || `Player ${index + 1}`}
                  </span>

                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDropOnPlayer(event, index)}
                    className="mr-1 flex h-12 w-12 items-center rounded-2xl bg-white shadow-inner transition-colors hover:bg-orange-50 lg:h-12 lg:w-14"
                  >
                    {playerTokens[index] ? (
                      <div
                        draggable
                        onDragStart={(event) => handleDragStart(event, playerTokens[index] || "")}
                        className="flex h-full w-full cursor-grab items-center justify-center rounded-2xl border-4 border-[#FFC17E] bg-white active:cursor-grabbing"
                      >
                        <img
                          src={availableTokens.find((token) => token.id === playerTokens[index])?.src}
                          alt="token"
                          className="pointer-events-none h-8 w-8 object-contain lg:w-10"
                        />
                      </div>
                    ) : (
                      <div className="pointer-events-none h-full w-full rounded-2xl bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-2 flex w-full justify-center gap-4 p-2"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropOnPool}
          >
            {availableTokens.map((token) => {
              const isPlaced = playerTokens.includes(token.id);

              return (
                <div key={token.id} className="flex h-16 w-16 items-center justify-center lg:h-20 lg:w-20">
                  {!isPlaced ? (
                    <div
                      draggable
                      onDragStart={(event) => handleDragStart(event, token.id)}
                      className="flex h-full w-full cursor-grab items-center justify-center rounded-2xl border-4 border-[#FFC17E] bg-white shadow-sm transition-transform hover:scale-110 active:cursor-grabbing"
                    >
                      <img src={token.src} alt={token.id} className="pointer-events-none h-10 w-10 object-contain lg:h-12 lg:w-12" />
                    </div>
                  ) : (
                    <div className="h-full w-full rounded-2xl border-4 border-dashed border-[#FFC17E] opacity-30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex h-full max-h-none w-full flex-col rounded-3xl bg-[#FFC17E] p-6 shadow-[0px_0px_4px_2px_rgba(0,0,0,0.3)] lg:col-span-2 lg:max-h-[420px]">
          <h2 className="mb-8 text-center text-3xl tracking-widest text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] lg:mb-4 lg:text-4xl">
            GAME SETTINGS
          </h2>

          <div className="flex flex-grow flex-col space-y-10">
            <div>
              <span className="mb-3 block text-lg uppercase tracking-wider text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] lg:text-xl">
                Edition
              </span>

              <div className="flex flex-wrap gap-3 lg:gap-4">
                {["TEMPLE", "MORAL TEACHING", "BHAGAVAD GITA", "HISTORY"].map((edition) => {
                  const isSelected = selectedEdition === edition;

                  return (
                    <button
                      key={edition}
                      disabled={!isHost}
                      onClick={() => setSelectedEdition(edition)}
                      className={`rounded-xl p-2 px-5 text-base tracking-wider text-white transition-all lg:text-lg ${
                        isSelected
                          ? "translate-y-[4px] bg-[#FF8C00] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]"
                          : "border-b-4 border-[#FF8C00] bg-[#FFA545] shadow-none hover:bg-[#ffb25c] disabled:opacity-50"
                      }`}
                    >
                      {edition}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mb-3 block text-lg uppercase tracking-wider text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] lg:text-xl">
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
                      className={`flex-1 rounded-xl p-2 text-base tracking-wider text-white transition-all lg:text-lg ${
                        isSelected
                          ? "translate-y-[4px] bg-[#FF8C00] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]"
                          : "border-b-4 border-[#FF8C00] bg-[#FFA545] shadow-none hover:bg-[#ffb25c] disabled:opacity-50"
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

      <div className="z-20 flex h-24 w-full shrink-0 flex-col items-center justify-center bg-[#FFC17E]">
        <button
          disabled={!canStart}
          onClick={handleStartGame}
          className={`relative h-[50px] w-[220px] rounded-2xl border-none font-jersey text-2xl tracking-widest text-white transition-all duration-300 lg:text-3xl ${
            canStart
              ? "animate-neon bg-[#FF9513] hover:scale-105 hover:bg-[#FFA545] active:scale-95 active:shadow-none"
              : "cursor-not-allowed bg-[#FF8C00] opacity-60"
          }`}
        >
          START
        </button>
      </div>
    </main>
  );
}
