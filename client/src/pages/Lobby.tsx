import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  const transitionNav = useNav();
  const standardNav = useNavigate();

  const hasKicked = useRef(false);
  const hasJoined = useRef<string | null>(null);

  // Clear state when URL changes
  useEffect(() => {
    setLobbyState(null);
    hasKicked.current = false;
    hasJoined.current = null;
  }, [lobbyCode]);

  useEffect(() => {
    if (authLoading) return;

    const handleGameUpdated = (nextState: GameState) => {
      if (nextState.lobbyCode !== lobbyCode) return;

      setLobbyState(nextState);
    };

    const handleGameError = (error: { message?: string } | string) => {
      console.log("Game socket error:", error);
    };
    
    const handleHostLeave = ({ message }: { message: string }) => {
      transitionNav("/home");
      showToast({
        variant: "error",
        title: "Lobby Closed",
        message: message,
      });
    };

    socket.on(GAME_EVENTS.GAME_UPDATED, handleGameUpdated);
    socket.on(GAME_EVENTS.GAME_ERROR, handleGameError);
    socket.on(GAME_EVENTS.LOBBY_CLOSED, handleHostLeave);

    if (hasJoined.current !== lobbyCode) {
      hasJoined.current = lobbyCode ?? null;

      socket.emit(GAME_EVENTS.LOBBY_JOIN, {
        lobbyCode,
        player: {
          uid,
          username,
        },
      });
    }

    return () => {
      socket.off(GAME_EVENTS.GAME_UPDATED, handleGameUpdated);
      socket.off(GAME_EVENTS.GAME_ERROR, handleGameError);
      socket.off(GAME_EVENTS.LOBBY_CLOSED, handleHostLeave);
    };
  }, [authLoading, lobbyCode, transitionNav, showToast, uid, username]);

  // Kick detection: If the user is not part of the lobby, navigate them away
  useEffect(() => {
    // Don't do anything if lobby hasn't loaded or no UID
    if (!lobbyState || !uid || lobbyState.lobbyCode !== lobbyCode) return;

    if (hasKicked.current) return;

    const isHost = lobbyState.host.uid === uid;
    const isPlayer = lobbyState.players.some((player) => player.uid === uid);

    // If lobby data exists but the user is neither the host nor a player, navigate them away
    if (!isHost && !isPlayer) {
      hasKicked.current = true;

      showToast({
        variant: "error",
        title: "Disconnected",
        message: "You have been removed from the lobby by the host.",
      });

      standardNav("/");
    }
  }, [lobbyState, lobbyCode, standardNav, showToast, uid]);

  const isCurrentlyPlayer = lobbyState && uid && (
    lobbyState.host.uid === uid || 
    lobbyState.players.some(p => p.uid === uid)
  );

  if (lobbyState && !isCurrentlyPlayer) {
    return (
      <main className="h-[calc(100vh-56px)] bg-white font-jersey flex items-center justify-center">
        <p className="text-3xl text-[#F97316] tracking-wider">Disconnecting...</p>
      </main>
    );
  }

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
