import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

function Lobby() {
  const { lobbyCode } = useParams();

  useEffect(() => {
    socket.on("error", ({ message }) => alert(message));

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  return (
    <>
      <div>Lobby Code: {lobbyCode}</div>
    </>
  );
}

export default Lobby;