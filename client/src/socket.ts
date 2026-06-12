import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://sanskrit-monopoly.onrender.com";

export const socket = io(SERVER_URL);