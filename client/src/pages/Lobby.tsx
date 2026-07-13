import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../components/TransitionOverlay";
import { useToast } from "../context/ToastContext";

import Game from "./Game";
import Result from "./Result";
import LobbyWaiting from "./LobbyWaiting"; // Import your new component

import { GAME_EVENTS } from "../constants/socket/gameEvents";
import type { GameState } from "../types/game/gameTypes";

export default function Lobby() {
  const [lobbyState, setLobbyState] = useState<GameState | null>(null);
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { uid, username, authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNav();

  useEffect(() => {
    if (authLoading) return;

    const handleGameUpdated = (nextState: GameState) => {
      setLobbyState(nextState);
    };

    const handleGameError = (error: { message?: string } | string) => {
      console.log("Game socket error:", error);
    };

    const handleHostLeave = ({ message }: { message: string }) => {
      navigate("/home");
      showToast({
        variant: "success",
        title: "Lobby Closed",
        message: message,
      });
    };

    socket.emit(GAME_EVENTS.LOBBY_JOIN, {
      lobbyCode,
      player: {
        uid,
        username,
      },
    });

    socket.on(GAME_EVENTS.GAME_UPDATED, handleGameUpdated);
    socket.on(GAME_EVENTS.GAME_ERROR, handleGameError);
    socket.on(GAME_EVENTS.LOBBY_CLOSED, handleHostLeave);

    return () => {
      socket.off(GAME_EVENTS.GAME_UPDATED, handleGameUpdated);
      socket.off(GAME_EVENTS.GAME_ERROR, handleGameError);
      socket.off(GAME_EVENTS.LOBBY_CLOSED, handleHostLeave);
    };
  }, [authLoading]);

  // --- TRAFFIC CONTROLLER ROUTING ---

  if (lobbyState && lobbyState.status === "playing") {
    return <Game gameState={lobbyState} />;
  }

  // todo (jyotirmoy): make the results screen render game data
  if (lobbyState && lobbyState.status === "finished") {
    return <Result gameState={lobbyState} />;
  }

  if (lobbyState && lobbyState.status === "waiting") {
    // Pass the state down to your new dedicated UI component
    return <LobbyWaiting lobbyState={lobbyState} lobbyCode={lobbyCode!} />;
  }

  // Fallback Loading State
  return (
    <main className="h-[calc(100vh-56px)] bg-white font-jersey flex items-center justify-center">
      <p className="text-3xl text-[#F97316] tracking-wider">Loading Lobby...</p>
    </main>
  );
}
