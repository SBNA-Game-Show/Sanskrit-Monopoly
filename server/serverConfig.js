import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

export const setupServer = () => {
  const app = express();
  const server = createServer(app);

  const allowedOrigins = [
    "http://localhost:5173",
    "https://sanskrit-monopoly.vercel.app"
  ];

  console.log("[BOOT] allowedOrigins =", allowedOrigins);
  
  const corsOptions = {
    origin: allowedOrigins,

    methods: ["GET", "POST"],
    credentials: true,
  };

  const io = new Server(server, {
    cors: corsOptions,
  });

  app.use(cors(corsOptions));
  app.use(json());

  return { app, server, io };
};